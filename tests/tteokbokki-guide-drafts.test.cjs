const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const fixture = require('./fixtures/tteokbokki-guides-before.json');
const packet = require('../content/tteokbokki-guide-updates.json');
const {
  TARGETS,
  FIELDS,
  createTteokbokkiGuideDrafts,
} = require('../studio/tteokbokkiGuideDrafts.cjs');
const copy = (value) => structuredClone(value);
const records = () =>
  new Map(
    [...fixture.documents, ...fixture.sources].map((doc) => [
      doc._id,
      copy(doc),
    ])
  );
function expectedDraft(index) {
  const { _id, _rev, _createdAt, _updatedAt, ...fields } = copy(
    fixture.documents[index]
  );
  for (const [field, type] of Object.entries(FIELDS))
    fields[field] = {
      _type: type,
      ...fields[field],
      ...copy(packet.updates[index].fields[field]),
    };
  return { ...fields, _id: `drafts.${_id}` };
}
function mock({ documents = records(), second, config, failCommit } = {}) {
  const state = { reads: 0, transactions: 0, commits: 0, created: [] };
  const client = {
    config: () => config || { projectId: 'o9hshko6', dataset: 'production' },
    getDocuments: async (ids) => {
      state.reads += 1;
      assert.deepEqual(ids, [
        ...TARGETS.flatMap(({ id }) => [id, `drafts.${id}`]),
        ...packet.sources.map((row) => row.id),
      ]);
      const docs = new Map([...documents].map(([id, doc]) => [id, copy(doc)]));
      if (state.reads > 1 && second) second(docs);
      return ids.map((id) => copy(docs.get(id) || null));
    },
    transaction: () => {
      state.transactions += 1;
      const transaction = {
        create: (doc) => {
          state.created.push(copy(doc));
          return transaction;
        },
        commit: async () => {
          state.commits += 1;
          if (failCommit) throw failCommit;
        },
      };
      return transaction;
    },
  };
  return { client, state };
}

test('creates two localized review drafts in one transaction while preserving names, slugs, images, German recipe and every recipe reference', async () => {
  const { client, state } = mock();
  const result = await createTteokbokkiGuideDrafts(client);
  assert.deepEqual(state.created, [expectedDraft(0), expectedDraft(1)]);
  assert.equal(state.transactions, 1);
  assert.equal(state.commits, 1);
  assert.equal(state.reads, 2);
  assert.deepEqual(
    result.results.map((row) => row.status),
    ['draft-created', 'draft-created']
  );
  assert.equal(state.created[1].description._type, 'localizedPortableText');
  assert.ok(state.created.every((doc) => doc._id.startsWith('drafts.')));
});

test('dry run creates no transaction and keeps all original documents unchanged', async () => {
  const documents = records(),
    before = copy([...documents]);
  const { client, state } = mock({ documents });
  const result = await createTteokbokkiGuideDrafts(client, { dryRun: true });
  assert.deepEqual(
    result.results.map((row) => row.status),
    ['would-create-draft', 'would-create-draft']
  );
  assert.equal(state.transactions, 0);
  assert.equal(state.reads, 1);
  assert.deepEqual([...documents], before);
});

test('wrong project or dataset stops before reads and writes', async () => {
  for (const config of [
    { projectId: 'wrong', dataset: 'production' },
    { projectId: 'o9hshko6', dataset: 'test' },
  ]) {
    const { client, state } = mock({ config });
    await assert.rejects(createTteokbokkiGuideDrafts(client), /프로젝트/);
    assert.equal(state.reads, 0);
    assert.equal(state.transactions, 0);
  }
});

test('missing documents, changed slugs or descriptions, and unrelated existing drafts abort the whole batch', async () => {
  for (const change of [
    (docs) => docs.delete(TARGETS[1].id),
    (docs) => {
      docs.get(TARGETS[0].id)._type = 'ingredient';
    },
    (docs) => {
      docs.get(TARGETS[1].id).slug.en = 'other-address';
    },
    (docs) => {
      docs.get(TARGETS[0].id).description.en[0].children[0].text =
        'Another editor text';
    },
    (docs) => {
      docs.set(`drafts.${TARGETS[1].id}`, {
        ...expectedDraft(1),
        name: { en: 'Another edit' },
        _rev: 'draft-rev',
      });
    },
  ]) {
    const documents = records();
    change(documents);
    const { client, state } = mock({ documents });
    await assert.rejects(createTteokbokkiGuideDrafts(client));
    assert.equal(state.transactions, 0);
  }
});

test('changed published ingredient quantities or cooking instructions block stale preparation advice', async () => {
  for (const index of [0, 7]) {
    const documents = records();
    const doc = documents.get(fixture.sources[index]._id);
    if (index === 0) doc.quantity.en = '500 g';
    else doc.description.en[0].children[0].text = 'New cooking instructions';
    const { client, state } = mock({ documents });
    await assert.rejects(
      createTteokbokkiGuideDrafts(client),
      /분량 또는 조리 단계/
    );
    assert.equal(state.transactions, 0);
  }
});

test('changed servings, timing or references block outdated recipe guidance', async () => {
  for (const change of [
    (doc) => {
      doc.servings.en = 4;
    },
    (doc) => {
      doc.preparationTime.en = 60;
    },
    (doc) => {
      doc.steps.reverse();
    },
  ]) {
    const documents = records();
    change(documents.get(TARGETS[0].id));
    const { client, state } = mock({ documents });
    await assert.rejects(createTteokbokkiGuideDrafts(client), /인분·시간·연결/);
    assert.equal(state.transactions, 0);
  }
});

test('concurrent source edits, draft creation and published removal abort before mutation', async () => {
  for (const second of [
    (docs) => {
      docs.get(fixture.sources[0]._id)._rev = 'new-amount-revision';
    },
    (docs) => {
      docs.set(`drafts.${TARGETS[0].id}`, {
        ...expectedDraft(0),
        _rev: 'new-draft',
      });
    },
    (docs) => docs.delete(TARGETS[1].id),
  ]) {
    const { client, state } = mock({ second });
    await assert.rejects(createTteokbokkiGuideDrafts(client), /확인 중/);
    assert.equal(state.transactions, 0);
  }
});

test('identical existing drafts are recognized even when Sanity reorders object keys', async () => {
  const reorder = (value) =>
    Array.isArray(value)
      ? value.map(reorder)
      : value && typeof value === 'object'
        ? Object.fromEntries(
            Object.entries(value)
              .reverse()
              .map(([key, item]) => [key, reorder(item)])
          )
        : value;
  const documents = records();
  TARGETS.forEach(({ id }, index) =>
    documents.set(
      `drafts.${id}`,
      reorder({
        ...expectedDraft(index),
        _rev: 'server-rev',
        _createdAt: 'now',
        _updatedAt: 'now',
      })
    )
  );
  const { client, state } = mock({ documents });
  const result = await createTteokbokkiGuideDrafts(client);
  assert.deepEqual(
    result.results.map((row) => row.status),
    ['already-prepared', 'already-prepared']
  );
  assert.equal(state.transactions, 0);
});

test('a published ingredient and an unfinished recipe only create the missing recipe draft', async () => {
  const documents = records();
  documents.set(TARGETS[1].id, {
    ...expectedDraft(1),
    _id: TARGETS[1].id,
    _rev: 'published-update',
  });
  const { client, state } = mock({ documents });
  const result = await createTteokbokkiGuideDrafts(client);
  assert.deepEqual(
    result.results.map((row) => row.status),
    ['draft-created', 'already-published']
  );
  assert.deepEqual(state.created, [expectedDraft(0)]);
});

test('a create conflict propagates without replace, patch or retries', async () => {
  const { client, state } = mock({ failCommit: new Error('409 draft exists') });
  await assert.rejects(createTteokbokkiGuideDrafts(client), /409/);
  assert.equal(state.transactions, 1);
  assert.equal(state.commits, 1);
});

test('the actual snapshot conversion makes the new rice-cake description eligible for the existing recipe ingredient link in both languages', () => {
  const root = path.join(__dirname, '..');
  const snapshot = fs.readFileSync(
    path.join(root, 'scripts/generate-sanity-build-snapshot.mjs'),
    'utf8'
  );
  const start = snapshot.indexOf('const decoratorMarks =');
  const end = snapshot.indexOf('const makeEntry =', start);
  assert.ok(start > 0 && end > start);
  const convert = vm.runInNewContext(
    snapshot.slice(start, end) + '\nportableTextToContentful'
  );
  const routes = vm.runInNewContext(
    fs
      .readFileSync(path.join(root, 'lib/ingredientDetailRoutes.js'), 'utf8')
      .replace(/^export /gm, '') +
      '\n({hasIngredientDetailContent,hasIngredientDetailPage})'
  );
  const page = fs.readFileSync(
    path.join(root, 'pages/recipes/[slug].js'),
    'utf8'
  );
  const linkStart = page.indexOf('const shouldLinkIngredient =');
  const linkEnd = page.indexOf('const descriptionText =', linkStart);
  assert.ok(linkStart > 0 && linkEnd > linkStart);
  const shouldLink = vm.runInNewContext(
    page.slice(linkStart, linkEnd) + '\nshouldLinkIngredient',
    routes
  );
  assert.equal(
    Boolean(
      shouldLink({ slug: 'tteokbokki-tteok', description: null, bild: null })
    ),
    false
  );
  for (const locale of ['en', 'de']) {
    const description = convert(packet.updates[1].fields.description[locale]);
    assert.equal(
      shouldLink({ slug: 'tteokbokki-tteok', description, bild: null }),
      true
    );
    assert.ok(
      routes.hasIngredientDetailPage({ slug: 'tteokbokki-tteok', description })
    );
    const links = description.content
      .flatMap((block) => block.content)
      .filter((node) => node.nodeType === 'hyperlink');
    assert.ok(links.some((node) => node.data.uri === '/recipes/tteokbokki'));
  }
});
