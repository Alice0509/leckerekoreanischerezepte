const test = require('node:test');
const assert = require('node:assert/strict');
const {
  INGREDIENT_IDS,
  RECIPE_IDS,
  getPantryStarter,
} = require('../lib/pantryStarter.cjs');

function fixture(locale) {
  return {
    locale,
    ingredientEntries: INGREDIENT_IDS.map((id, index) => ({
      sys: { id },
      fields: { slug: `ingredient-${locale}-${index}` },
    })),
    recipesById: Object.fromEntries(
      RECIPE_IDS.map((id, index) => [
        id,
        {
          slug: `recipe-${locale}-${index}`,
          titel: `${locale} Recipe ${index}`,
          image: 'https://cdn.sanity.io/images/test.jpg',
        },
      ])
    ),
  };
}

test('builds both language guides from existing published ingredient and recipe IDs', () => {
  for (const locale of ['en', 'de']) {
    const guide = getPantryStarter(fixture(locale));
    assert.equal(guide.locale, locale);
    assert.deepEqual(
      guide.ingredients.map((item) => item.id),
      INGREDIENT_IDS
    );
    assert.deepEqual(
      guide.recipes.map((item) => item.id),
      RECIPE_IDS
    );
    assert.ok(
      guide.ingredients.every((item) =>
        item.slug.startsWith(`ingredient-${locale}-`)
      )
    );
    assert.ok(
      guide.recipes.every(
        (item) =>
          item.slug.startsWith(`recipe-${locale}-`) &&
          item.titel.startsWith(locale)
      )
    );
  }
});

test('missing or malformed published data prevents broken links from being built', () => {
  const options = fixture('en');
  options.ingredientEntries[0].fields.slug = '../unsafe';
  assert.throws(
    () => getPantryStarter(options),
    /Missing published en pantry ingredient/
  );
  options.ingredientEntries = [];
  assert.throws(
    () => getPantryStarter(options),
    /Missing published en pantry ingredient/
  );
  const incomplete = fixture('de');
  delete incomplete.recipesById[RECIPE_IDS[0]].image;
  assert.throws(
    () => getPantryStarter(incomplete),
    /Missing published de starter recipe/
  );
});
