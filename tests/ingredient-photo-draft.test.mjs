import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGoldenCurryPhotoDraft,
  GOLDEN_CURRY_ID,
} from '../studio/ingredientPhotoDraft.mjs';

const photo = Buffer.from([0xff, 0xd8, 0xff]);
const published = {
  _id: GOLDEN_CURRY_ID,
  _type: 'ingredient',
  _rev: 'original',
  _createdAt: '2026-10-03',
  _updatedAt: '2026-10-03',
  name: { en: 'Japanese curry roux', de: 'Japanische Curry-Roux' },
  slug: {
    _type: 'localizedSlug',
    en: 'sb-golden-curry-roux',
    de: 'sb-golden-curry-roux',
  },
  description: {
    en: [{ _type: 'block', children: [{ text: 'Global introduction' }] }],
  },
};
function fixture(
  rows = [
    [published, null],
    [published, null],
  ]
) {
  const writes = [];
  const client = {
    config: () => ({ projectId: 'o9hshko6', dataset: 'production' }),
    getDocuments: async () => structuredClone(rows.shift()),
    assets: {
      upload: async () => {
        writes.push('asset');
        return { _id: 'image-photo' };
      },
    },
    create: async (doc) => {
      writes.push(doc);
      return doc;
    },
  };
  return { client, writes };
}
test('adds only a draft photo while preserving descriptions, slugs and names', async () => {
  const { client, writes } = fixture();
  const result = await createGoldenCurryPhotoDraft(client, photo);
  assert.equal(result.status, 'draft-created');
  assert.equal(writes.length, 2);
  const draft = writes[1];
  assert.equal(draft._id, `drafts.${GOLDEN_CURRY_ID}`);
  assert.deepEqual(draft.description, published.description);
  assert.deepEqual(draft.slug, published.slug);
  assert.deepEqual(draft.name, published.name);
  assert.equal(draft.bild.asset._ref, 'image-photo');
  assert.equal(draft._rev, undefined);
  assert.equal(draft._updatedAt, undefined);
});
test('existing drafts are never overwritten and an existing published photo is a no-op', async () => {
  const existing = fixture([[published, { _id: `drafts.${GOLDEN_CURRY_ID}` }]]);
  await assert.rejects(
    createGoldenCurryPhotoDraft(existing.client, photo),
    /초안/
  );
  assert.deepEqual(existing.writes, []);
  const hasPhoto = fixture([
    [{ ...published, bild: { asset: { _ref: 'image-existing' } } }, null],
  ]);
  assert.equal(
    (await createGoldenCurryPhotoDraft(hasPhoto.client, photo)).status,
    'already-has-photo'
  );
  assert.deepEqual(hasPhoto.writes, []);
});
test('a concurrent published edit or new draft aborts creation', async () => {
  for (const latest of [
    [{ ...published, _rev: 'changed' }, null],
    [published, { _id: 'new-draft' }],
  ]) {
    const { client, writes } = fixture([[published, null], latest]);
    await assert.rejects(createGoldenCurryPhotoDraft(client, photo), /수정/);
    assert.deepEqual(writes, ['asset']);
  }
});
test('wrong project, missing ingredient and invalid image produce no writes', async () => {
  const wrongProject = fixture();
  wrongProject.client.config = () => ({
    projectId: 'other',
    dataset: 'production',
  });
  await assert.rejects(
    createGoldenCurryPhotoDraft(wrongProject.client, photo),
    /프로젝트/
  );
  assert.deepEqual(wrongProject.writes, []);
  const missing = fixture([[null, null]]);
  await assert.rejects(
    createGoldenCurryPhotoDraft(missing.client, photo),
    /찾지/
  );
  assert.deepEqual(missing.writes, []);
  const invalid = fixture();
  await assert.rejects(
    createGoldenCurryPhotoDraft(invalid.client, Buffer.from('text')),
    /JPEG/
  );
  assert.deepEqual(invalid.writes, []);
});

test('a changed or malformed localized slug aborts before uploading a photo', async () => {
  for (const slug of [
    { en: 'different-ingredient', de: 'sb-golden-curry-roux' },
    { en: 'sb-golden-curry-roux', de: 'different-ingredient' },
    {
      en: { current: 'sb-golden-curry-roux' },
      de: { current: 'sb-golden-curry-roux' },
    },
    { en: 'sb-golden-curry-roux' },
    null,
  ]) {
    const { client, writes } = fixture([[{ ...published, slug }, null]]);
    await assert.rejects(createGoldenCurryPhotoDraft(client, photo), /주소/);
    assert.deepEqual(writes, []);
  }
});
