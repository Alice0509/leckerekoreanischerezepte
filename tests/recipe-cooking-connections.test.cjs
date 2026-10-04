const test = require('node:test');
const assert = require('node:assert/strict');
const {
  companionIds,
  companionReason,
  prioritizeCompanions,
} = require('../lib/recipeCompanions.cjs');

const soup = '1WsefXmdbl6zzAkwV7RRPC';
const rice = '3xVgSUpUDFy86XnwHgzEYg';
const eggs = '3dfdSrm5oVqxp7CAr3QDG3';
const sauce = '4scruZVHnEMVsSTYtN5sl9';
const pancake = '38Ox8shT32YDdOYfxBamOO';
const entry = (id, slug = id) => ({ sys: { id }, fields: { slug } });

test('a soup promotes rice and eggs before its original category recommendations without mutating the catalog', () => {
  const input = [entry('another-soup'), entry(eggs), entry(rice)];
  const before = structuredClone(input);
  assert.deepEqual(companionIds(soup), [rice, eggs]);
  assert.deepEqual(
    prioritizeCompanions(input, soup).map((item) => item.sys.id),
    [rice, eggs, 'another-soup']
  );
  assert.deepEqual(input, before);
});

test('missing or draft targets never produce recommendations and duplicates are removed', () => {
  const items = [null, entry('drafts.' + rice), entry(eggs), entry(eggs)];
  assert.deepEqual(
    prioritizeCompanions(items, soup).map((item) => item.sys.id),
    [eggs]
  );
  assert.deepEqual(prioritizeCompanions([], soup), []);
});

test('the sauce and pancake link both ways using each locale catalog slug', () => {
  for (const slug of [
    'localized-english-pancake',
    'localized-german-pancake',
  ]) {
    assert.equal(
      prioritizeCompanions([entry(pancake, slug)], sauce)[0].fields.slug,
      slug
    );
  }
  assert.deepEqual(companionIds(pancake), [sauce]);
  assert.match(companionReason(sauce, pancake, 'en'), /dipping sauce/);
  assert.match(companionReason(sauce, pancake, 'de'), /Kimchi-Pfannkuchen/);
});

test('unknown recipes preserve existing recommendation order and do not get invented reasons', () => {
  const items = [entry('b'), entry('a')];
  assert.deepEqual(prioritizeCompanions(items, 'unconfigured'), items);
  assert.deepEqual(companionIds('unconfigured'), []);
  assert.equal(companionReason(soup, 'unconfigured', 'en'), '');
  assert.equal(companionReason('unconfigured', rice, 'de'), '');
});
