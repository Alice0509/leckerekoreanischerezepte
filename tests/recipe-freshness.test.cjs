const test = require('node:test');
const assert = require('node:assert/strict');
const {
  firstPublicationDate,
  isNewRecipe,
  latestRecipes,
  NEW_RECIPE_MS,
} = require('../lib/recipeFreshness.cjs');
const {
  companionId,
  prioritizeCompanions,
} = require('../lib/recipeCompanions.cjs');

test('migration and ordinary draft creation dates never become first publication dates', () => {
  const now = '2026-10-04T12:00:00Z';
  assert.equal(
    firstPublicationDate({
      _id: 'old-recipe',
      legacyContentfulId: 'old',
      _createdAt: now,
    }),
    null
  );
  assert.equal(
    firstPublicationDate({ _id: 'manual-recipe', _createdAt: now }),
    null
  );
  assert.equal(
    firstPublicationDate({ _id: 'drafts.chat-recipe-new', _createdAt: now }),
    null
  );
  assert.equal(
    firstPublicationDate({ _id: 'chat-recipe-new', _createdAt: now }),
    now
  );
  assert.equal(
    firstPublicationDate({
      _id: 'chat-recipe-new',
      firstPublishedAt: '2026-09-01T12:00:00Z',
      _createdAt: now,
      _updatedAt: now,
    }),
    '2026-09-01T12:00:00Z'
  );
});

test('NEW expires at 30 days, never appears for unknown or future dates, and ignores edits', () => {
  const date = '2026-10-04T12:00:00Z';
  const start = Date.parse(date);
  assert.equal(isNewRecipe(date, start), true);
  assert.equal(isNewRecipe(date, start + NEW_RECIPE_MS - 1), true);
  assert.equal(isNewRecipe(date, start + NEW_RECIPE_MS), false);
  assert.equal(isNewRecipe(date, start - 1), false);
  for (const value of [null, undefined, '', 'invalid', '2026-10-04'])
    assert.equal(isNewRecipe(value, start), false);
  const old = {
    _id: 'chat-recipe-old',
    _createdAt: '2026-07-01T12:00:00Z',
    _updatedAt: date,
  };
  assert.equal(isNewRecipe(firstPublicationDate(old), start), false);
});

test('latest section uses known first publication dates, keeps edits from jumping ahead, and does not reorder inputs', () => {
  const recipes = [
    { id: 'legacy', firstPublishedAt: null },
    { id: 'curry', firstPublishedAt: '2026-10-03T12:00:00Z' },
    {
      id: 'old',
      firstPublishedAt: '2025-01-01T12:00:00Z',
      updatedAt: '2026-10-04T14:00:00Z',
    },
    { id: 'bibim', firstPublishedAt: '2026-10-04T09:00:00Z' },
    { id: 'future', firstPublishedAt: '2026-11-01T12:00:00Z' },
  ];
  const before = structuredClone(recipes);
  assert.deepEqual(
    latestRecipes(recipes, '2026-10-04T12:00:00Z').map((r) => r.id),
    ['bibim', 'curry', 'old']
  );
  assert.deepEqual(recipes, before);
  assert.equal(
    latestRecipes([{ id: 'unknown' }], '2026-10-04T12:00:00Z').length,
    0
  );
});

test('sauce and noodle guide prioritize one another using IDs and preserve localized links', () => {
  const sauce = 'chat-recipe-bibim-noodle-sauce';
  const guide = '1EflHHVSRKo4tSzbUD7aBX';
  assert.equal(companionId(sauce), guide);
  assert.equal(companionId(guide), sauce);
  assert.equal(companionId('unrelated'), null);
  const items = [
    { sys: { id: 'other' } },
    { sys: { id: guide }, fields: { slug: 'localized-guide' } },
  ];
  assert.equal(
    prioritizeCompanions(items, sauce)[0].fields.slug,
    'localized-guide'
  );
  assert.equal(items[0].sys.id, 'other');
  assert.equal(prioritizeCompanions([items[0]], sauce).length, 1);
});
