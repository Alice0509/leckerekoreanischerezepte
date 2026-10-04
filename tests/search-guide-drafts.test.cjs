const test = require('node:test');
const assert = require('node:assert/strict');
const originals = require('./fixtures/search-guides-before.json');
const packet = require('../content/search-guide-updates.json');
const {
  TARGETS,
  FIELDS,
  createSearchGuideDrafts,
} = require('../studio/searchGuideDrafts.cjs');

const copy = (value) => structuredClone(value);
function mock({
  documents = originals.flatMap((doc) => [copy(doc), null]),
  second,
  config,
  failCommit,
} = {}) {
  let reads = 0;
  const created = [];
  const state = { reads: () => reads, transactions: 0, commits: 0, created };
  const client = {
    config: () => config || { projectId: 'o9hshko6', dataset: 'production' },
    getDocuments: async (ids) => {
      assert.deepEqual(
        ids,
        TARGETS.flatMap(({ id }) => [id, `drafts.${id}`])
      );
      reads += 1;
      return copy(reads > 1 && second ? second : documents);
    },
    transaction: () => {
      state.transactions += 1;
      const transaction = {
        create: (doc) => {
          created.push(copy(doc));
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
function expectedDraft(index) {
  const { _rev, _createdAt, _updatedAt, ...doc } = copy(originals[index]);
  doc._id = `drafts.${doc._id}`;
  for (const field of FIELDS)
    doc[field][TARGETS[index].locale] = copy(
      packet.updates[index].fields[field]
    );
  return doc;
}

test('one create-only transaction changes three localized descriptions and SEO fields; all other content is preserved', async () => {
  const { client, state } = mock();
  const result = await createSearchGuideDrafts(client);
  assert.equal(state.reads(), 2);
  assert.equal(state.transactions, 1);
  assert.equal(state.commits, 1);
  assert.deepEqual(
    state.created,
    TARGETS.map((_, index) => expectedDraft(index))
  );
  assert.deepEqual(
    result.results.map((row) => row.status),
    Array(3).fill('draft-created')
  );
  assert.ok(state.created.every((doc) => doc._id.startsWith('drafts.')));
});

test('dry run performs no transaction and does not mutate source documents', async () => {
  const documents = originals.flatMap((doc) => [copy(doc), null]);
  const before = copy(documents);
  const { client, state } = mock({ documents });
  const result = await createSearchGuideDrafts(client, { dryRun: true });
  assert.deepEqual(
    result.results.map((row) => row.status),
    Array(3).fill('would-create-draft')
  );
  assert.equal(state.transactions, 0);
  assert.equal(state.reads(), 1);
  assert.deepEqual(documents, before);
});

test('wrong project or dataset stops before reading or writing', async () => {
  for (const config of [
    { projectId: 'wrong', dataset: 'production' },
    { projectId: 'o9hshko6', dataset: 'test' },
  ]) {
    const { client, state } = mock({ config });
    await assert.rejects(createSearchGuideDrafts(client), /프로젝트/);
    assert.equal(state.reads(), 0);
    assert.equal(state.transactions, 0);
  }
});

test('missing or changed documents, wrong slugs and unrelated drafts abort the whole batch', async () => {
  const corruptions = [
    (docs) => {
      docs[4] = null;
    },
    (docs) => {
      docs[2]._type = 'ingredient';
    },
    (docs) => {
      docs[0].slug.en = 'changed';
    },
    (docs) => {
      docs[4].description.de[0].children[0].text = 'New editor text';
    },
    (docs) => {
      docs[3] = {
        ...expectedDraft(1),
        titel: { en: 'Another edit' },
        _rev: 'draft-rev',
      };
    },
  ];
  for (const corrupt of corruptions) {
    const documents = originals.flatMap((doc) => [copy(doc), null]);
    corrupt(documents);
    const { client, state } = mock({ documents });
    await assert.rejects(createSearchGuideDrafts(client));
    assert.equal(state.transactions, 0);
  }
});

test('a concurrent published change, draft creation or removal aborts before mutation', async () => {
  for (const change of [
    (docs) => {
      docs[2]._rev = 'new-revision';
    },
    (docs) => {
      docs[1] = { ...expectedDraft(0), _rev: 'new-draft' };
    },
    (docs) => {
      docs[4] = null;
    },
  ]) {
    const second = originals.flatMap((doc) => [copy(doc), null]);
    change(second);
    const { client, state } = mock({ second });
    await assert.rejects(createSearchGuideDrafts(client), /確認|수정/);
    assert.equal(state.transactions, 0);
  }
});

test('identical existing drafts are recognized despite object key reordering', async () => {
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
  const documents = originals.flatMap((doc, index) => [
    copy(doc),
    reorder({
      ...expectedDraft(index),
      _rev: 'server-rev',
      _createdAt: 'now',
      _updatedAt: 'now',
    }),
  ]);
  const { client, state } = mock({ documents });
  const result = await createSearchGuideDrafts(client);
  assert.deepEqual(
    result.results.map((row) => row.status),
    Array(3).fill('already-prepared')
  );
  assert.equal(state.transactions, 0);
});

test('a mixture of already published, prepared and unfinished pages only creates the missing draft', async () => {
  const documents = originals.flatMap((doc) => [copy(doc), null]);
  documents[0] = {
    ...expectedDraft(0),
    _id: originals[0]._id,
    _rev: 'published-update',
  };
  documents[3] = { ...expectedDraft(1), _rev: 'existing-draft' };
  const { client, state } = mock({ documents });
  const result = await createSearchGuideDrafts(client);
  assert.deepEqual(
    result.results.map((row) => row.status),
    ['already-published', 'already-prepared', 'draft-created']
  );
  assert.deepEqual(state.created, [expectedDraft(2)]);
});

test('a create conflict propagates without replacing, patching or retrying existing documents', async () => {
  const { client, state } = mock({
    failCommit: new Error('409 draft already exists'),
  });
  await assert.rejects(createSearchGuideDrafts(client), /409/);
  assert.equal(state.transactions, 1);
  assert.equal(state.commits, 1);
});
