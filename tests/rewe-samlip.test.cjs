const test = require('node:test');
const assert = require('node:assert/strict');
const registry = require('../lib/affiliate-links.json');
const {
  getIngredientShoppingGuide,
} = require('../lib/ingredientShoppingGuides.cjs');
const { getRecipeShoppingIngredients } = require('../lib/recipeShopping.cjs');
const { getApprovedKitchenOptions } = require('../lib/kitchenPicks.cjs');
const { getReweProductHelp } = require('../lib/reweProductHelp.cjs');
const issued = [
  'https://www.awin1.com/cread.php?awinmid=11652&awinaffid=3113363&ued=https%3A%2F%2Fwww.rewe.de%2Fshop%2Fp%2Fsamlip-panko-paniermehl-200g%2F2072098',
  'https://www.awin1.com/cread.php?awinmid=11652&awinaffid=3113363&ued=https%3A%2F%2Fwww.rewe.de%2Fshop%2Fp%2Frewe-beste-wahl-panko-paniermehl-140g%2F2666357',
];

test('Samlip is first in German ingredient, recipe and hub options; both exact issued links retain their own product and app fallback', () => {
  const ingredientStores = getIngredientShoppingGuide('paniermehl', 'de', {
    enabled: true,
  }).groups[0].stores;
  const recipeStores = getRecipeShoppingIngredients(
    [{ slug: 'paniermehl', name: 'Paniermehl' }],
    'de',
    { enabled: true }
  )[0].groups[0].stores;
  const hub = getApprovedKitchenOptions('de', { enabled: true }).filter(
    (item) => item.ingredient === 'paniermehl'
  );
  for (const stores of [ingredientStores, recipeStores, hub]) {
    assert.deepEqual(
      stores.map((item) => item.link.href),
      issued
    );
    assert.match(stores[0].productTitle, /Samlip.*200 g/);
    assert.match(stores[0].variantLabel, /Koreanisches.*Samlip/);
    assert.match(stores[1].variantLabel, /Alternative Marke/);
    for (const [i, item] of stores.entries()) {
      const sourceUrl = new URL(issued[i]).searchParams.get('ued');
      assert.deepEqual(
        registry.find((entry) => entry.affiliateUrl === issued[i]),
        {
          sourceUrl,
          affiliateUrl: issued[i],
          locale: 'de',
          advertiserName: 'REWE',
          approved: true,
        }
      );
      assert.equal(getReweProductHelp(item, 'de').webUrl, sourceUrl);
    }
  }
  for (const enabled of [true, false]) {
    const english = getIngredientShoppingGuide('paniermehl', 'en', { enabled });
    assert.doesNotMatch(JSON.stringify(english), /rewe\.de|awin1\.com/);
  }
  const ordinary = getIngredientShoppingGuide('paniermehl', 'de', {
    enabled: false,
  }).groups[0].stores;
  assert.deepEqual(
    ordinary.map((item) => item.link.href),
    issued.map((href) => new URL(href).searchParams.get('ued'))
  );
  assert.ok(ordinary.every((item) => item.link.isAffiliate === false));
});
