const test = require('node:test');
const assert = require('node:assert/strict');
const plan = require('../content/search-page-growth-updates.json');
const {
  prepare,
  updateSearchPages,
} = require('../studio/searchPageGrowthUpdate.cjs');

function documents() {
  return plan.recipes.map((item) => ({
    _id: item.id,
    _rev: 'original-revision',
    _type: 'recipe',
    slug: structuredClone(item.slug),
    ...structuredClone(item.before),
    ingredients: [{ _type: 'reference', _ref: 'existing-ingredient' }],
    steps: [{ _type: 'reference', _ref: 'existing-step' }],
    image: [{ _type: 'image', asset: { _ref: 'existing-image' } }],
  }));
}

function service(rows = documents(), options = {}) {
  let reads = 0;
  const state = { rows: structuredClone(rows), writes: 0 };
  return {
    state,
    config: () => ({
      projectId: plan.projectId,
      dataset: plan.dataset,
      perspective: 'raw',
      useCdn: false,
      ...options.config,
    }),
    fetch: async (_query, params) => {
      reads++;
      if (reads === 2 && options.onReview) options.onReview(state.rows);
      assert.ok(params.ids.includes(`drafts.${plan.recipes[0].id}`));
      return structuredClone(
        state.rows.filter((doc) => params.ids.includes(doc._id))
      );
    },
    mutate: async (mutations) => {
      if (options.onCommit) options.onCommit(state.rows);
      const next = structuredClone(state.rows);
      for (const { patch } of mutations) {
        const doc = next.find((row) => row._id === patch.id);
        if (doc._rev !== patch.ifRevisionID)
          throw new Error('Revision conflict');
        Object.assign(doc, structuredClone(patch.set), {
          _rev: 'updated-revision',
        });
      }
      state.rows = next;
      state.writes++;
    },
  };
}

test('preview makes no writes and includes the two bilingual pages for review', async () => {
  const client = service();
  const result = await updateSearchPages(client);
  assert.equal(result.changedDocuments, 2);
  assert.equal(result.written, false);
  assert.equal(client.state.writes, 0);
  assert.deepEqual(
    result.pages.map((page) => page.slug),
    ['chogochujang', 'miyeokguk']
  );
  for (const page of result.pages)
    for (const lang of ['en', 'de']) {
      assert.ok(page.title[lang]);
      assert.ok(page.introduction[lang]);
    }
});

test('one transaction updates only search copy, preserves recipe content, and repeat runs are a no-op', async () => {
  const client = service();
  const before = structuredClone(client.state.rows);
  assert.equal(
    (await updateSearchPages(client, { apply: true })).written,
    true
  );
  assert.equal(client.state.writes, 1);
  for (const [index, doc] of client.state.rows.entries()) {
    for (const field of ['slug', 'ingredients', 'steps', 'image'])
      assert.deepEqual(doc[field], before[index][field]);
    for (const lang of ['en', 'de'])
      assert.deepEqual(
        doc.description[lang].slice(1),
        before[index].description[lang]
      );
  }
  assert.equal(
    (await updateSearchPages(client, { apply: true })).written,
    false
  );
  assert.equal(client.state.writes, 1);
});

test('a changed title, URL, draft or missing document blocks the whole update', () => {
  const cases = [
    (rows) => {
      rows[0].seoTitle.en = 'Editor change';
    },
    (rows) => {
      rows[1].slug.de = 'new-url';
    },
    (rows) => {
      rows.push({ _id: `drafts.${rows[0]._id}`, _type: 'recipe' });
    },
    (rows) => {
      rows.pop();
    },
  ];
  for (const modify of cases) {
    const rows = documents();
    modify(rows);
    assert.throws(() => prepare(rows));
  }
});

test('wrong project, dataset or query perspective blocks reads and writes', async () => {
  for (const config of [
    { projectId: 'other' },
    { dataset: 'test' },
    { perspective: 'published' },
    { useCdn: true },
  ]) {
    const client = service(undefined, { config });
    await assert.rejects(updateSearchPages(client, { apply: true }));
    assert.equal(client.state.writes, 0);
  }
});

test('a revision or draft changed during review cancels all writes', async () => {
  for (const onReview of [
    (rows) => {
      rows[0]._rev = 'other-revision';
    },
    (rows) => {
      rows.push({ _id: `drafts.${rows[1]._id}`, _type: 'recipe' });
    },
  ]) {
    const client = service(undefined, { onReview });
    await assert.rejects(updateSearchPages(client, { apply: true }));
    assert.equal(client.state.writes, 0);
  }
});

test('a last-moment revision conflict cannot partially update the two recipes', async () => {
  const client = service(undefined, {
    onCommit: (rows) => {
      rows[1]._rev = 'concurrent-revision';
    },
  });
  await assert.rejects(
    updateSearchPages(client, { apply: true }),
    /Revision conflict/
  );
  assert.equal(client.state.writes, 0);
  for (const [index, doc] of client.state.rows.entries())
    assert.deepEqual(doc.description, plan.recipes[index].before.description);
});
