const test = require('node:test');
const assert = require('node:assert/strict');
const original = require('./fixtures/gochugaru-before.json');
const replacement = require('../content/gochugaru-english-guide.json');
const {
  GOCHUGARU_ID,
  createGochugaruEnglishDraft,
} = require('../studio/gochugaruEnglishDraft.cjs');

function fixture({
  document = original,
  draft = null,
  config,
  secondRead,
} = {}) {
  let reads = 0;
  const writes = [];
  const client = {
    config: () => config || { projectId: 'o9hshko6', dataset: 'production' },
    getDocuments: async (ids) => {
      assert.deepEqual(ids, [GOCHUGARU_ID, `drafts.${GOCHUGARU_ID}`]);
      reads += 1;
      return structuredClone(
        reads === 2 && secondRead ? secondRead : [document, draft]
      );
    },
    create: async (value) => {
      writes.push(value);
      return value;
    },
  };
  return { client, writes };
}

test('creates only an English review draft and preserves the German content, photo and other fields', async () => {
  const { client, writes } = fixture();
  assert.deepEqual(await createGochugaruEnglishDraft(client), {
    status: 'draft-created',
    id: `drafts.${GOCHUGARU_ID}`,
  });
  assert.equal(writes.length, 1);
  const actual = writes[0];
  const { _rev, _createdAt, _updatedAt, ...expected } =
    structuredClone(original);
  expected._id = `drafts.${GOCHUGARU_ID}`;
  expected.description.en = replacement.blocks;
  assert.deepEqual(actual, expected);
  assert.ok(
    actual.description.en.every(
      (block) =>
        block._type === 'block' &&
        block.children.every((child) => child._type === 'span')
    )
  );
  assert.equal(
    new Set(actual.description.en.map((block) => block._key)).size,
    actual.description.en.length
  );
});

test('refuses an existing draft, unexpected slug, changed English content or missing ingredient without writes', async () => {
  for (const options of [
    { draft: { _id: `drafts.${GOCHUGARU_ID}` } },
    { document: { ...original, slug: { en: 'other', de: 'gochugaru' } } },
    {
      document: {
        ...original,
        description: { ...original.description, en: [] },
      },
    },
    { document: null },
    { document: { ...original, _type: 'recipe' } },
  ]) {
    const { client, writes } = fixture(options);
    await assert.rejects(() => createGochugaruEnglishDraft(client));
    assert.deepEqual(writes, []);
  }
});

test('refuses the wrong project or dataset without reading or writing documents', async () => {
  for (const config of [
    { projectId: 'other', dataset: 'production' },
    { projectId: 'o9hshko6', dataset: 'staging' },
  ]) {
    const { client, writes } = fixture({ config });
    client.getDocuments = async () => {
      assert.fail('must not read');
    };
    await assert.rejects(() => createGochugaruEnglishDraft(client));
    assert.deepEqual(writes, []);
  }
});

test('aborts if the published revision changes or another draft appears during review', async () => {
  for (const secondRead of [
    [{ ...original, _rev: 'changed' }, null],
    [original, { _id: 'new-draft' }],
    [null, null],
  ]) {
    const { client, writes } = fixture({ secondRead });
    await assert.rejects(() => createGochugaruEnglishDraft(client));
    assert.deepEqual(writes, []);
  }
});

test('does not recreate a draft when the prepared English description is already published', async () => {
  const { client, writes } = fixture({
    document: {
      ...original,
      description: { ...original.description, en: replacement.blocks },
    },
  });
  assert.deepEqual(await createGochugaruEnglishDraft(client), {
    status: 'already-updated',
    id: GOCHUGARU_ID,
  });
  assert.deepEqual(writes, []);
});

test('a concurrent draft conflict propagates without a fallback overwrite', async () => {
  const { client } = fixture();
  client.create = async () => {
    throw new Error('document already exists');
  };
  await assert.rejects(
    () => createGochugaruEnglishDraft(client),
    /document already exists/
  );
});
