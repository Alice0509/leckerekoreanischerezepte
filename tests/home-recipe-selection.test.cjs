const test = require('node:test');
const assert = require('node:assert/strict');
const {
  WEEKLY_RECIPE_IDS,
  berlinWeek,
  selectHomeRecipes,
} = require('../lib/homeRecipeSelection.cjs');
const recipe = (id, firstPublishedAt = null) => ({
  id,
  firstPublishedAt,
  slug: id,
  titel: id,
});
const catalog = () => [
  recipe('bibim', '2026-10-04T09:36:34Z'),
  recipe('curry', '2026-10-03T10:00:00Z'),
  ...WEEKLY_RECIPE_IDS.map((id) => recipe(id)),
];

test('home has two latest recipes and one distinct curated weekly pick', () => {
  const input = catalog();
  const before = structuredClone(input);
  const result = selectHomeRecipes(input, '2026-10-04T12:00:00Z');
  assert.deepEqual(
    result.map((slot) => slot.role),
    ['latest', 'latest', 'weekly']
  );
  assert.deepEqual(
    result.slice(0, 2).map((slot) => slot.recipe.id),
    ['bibim', 'curry']
  );
  assert.equal(new Set(result.map((slot) => slot.recipe.id)).size, 3);
  assert.ok(WEEKLY_RECIPE_IDS.includes(result[2].recipe.id));
  assert.deepEqual(input, before);
});

test('rotation is stable for the Berlin week and switches on Monday even without a new build', () => {
  const input = catalog();
  const sunday = '2026-10-04T21:59:59Z';
  const monday = '2026-10-04T22:00:00Z';
  assert.equal(berlinWeek(monday), berlinWeek(sunday) + 1);
  assert.equal(
    selectHomeRecipes(input, sunday)[2].recipe.id,
    selectHomeRecipes(input, '2026-09-28T12:00:00Z')[2].recipe.id
  );
  assert.notEqual(
    selectHomeRecipes(input, sunday)[2].recipe.id,
    selectHomeRecipes(input, monday)[2].recipe.id
  );
  // German winter time: Monday begins at 23:00 UTC.
  assert.equal(
    berlinWeek('2026-10-25T23:00:00Z'),
    berlinWeek('2026-10-25T22:59:59Z') + 1
  );
  const de = input.map((row) => ({
    ...row,
    slug: 'de-' + row.slug,
    titel: 'DE ' + row.titel,
  }));
  assert.equal(
    selectHomeRecipes(input, monday)[2].recipe.id,
    selectHomeRecipes(de, monday)[2].recipe.id
  );
});

test('few dated recipes still fill three honest slots, while unavailable and future entries are excluded', () => {
  const input = [
    recipe('known', '2026-10-04T09:00:00Z'),
    recipe('archive-a'),
    recipe('archive-b'),
    recipe('future', '2027-01-01T00:00:00Z'),
    recipe('broken'),
  ];
  input.at(-1).slug = null;
  const slots = selectHomeRecipes(input, '2026-10-04T12:00:00Z');
  assert.deepEqual(
    slots.map((slot) => slot.role),
    ['latest', 'archive', 'weekly']
  );
  assert.equal(slots.length, 3);
  assert.ok(
    !slots.some((slot) => ['future', 'broken'].includes(slot.recipe.id))
  );
  assert.equal(
    selectHomeRecipes([recipe('only')], '2026-10-04T12:00:00Z').length,
    1
  );
  assert.equal(selectHomeRecipes(input, 'invalid').length, 0);
});
