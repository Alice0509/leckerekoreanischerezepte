const test = require('node:test');
const assert = require('node:assert/strict');
const registry = require('../lib/affiliate-links.json');
const products = require('../lib/ingredientShoppingProducts.json');
const { getPurchaseLinks } = require('../lib/purchaseLinks.cjs');
const {
  getIngredientShoppingGuide,
} = require('../lib/ingredientShoppingGuides.cjs');
const { getApprovedKitchenOptions } = require('../lib/kitchenPicks.cjs');
const { getRecipeShoppingIngredients } = require('../lib/recipeShopping.cjs');

test('issued REWE link belongs to the approved publisher and exactly the existing German flour product', () => {
  assert.equal(registry.length, 5);
  const [entry] = registry;
  const url = new URL(entry.affiliateUrl);
  assert.equal(url.origin, 'https://www.awin1.com');
  assert.equal(url.pathname, '/cread.php');
  assert.equal(url.searchParams.get('awinmid'), '11652');
  assert.equal(url.searchParams.get('awinaffid'), '3113363');
  assert.equal(
    url.searchParams.get('ued'),
    products['wheat-flour-type-550'].de[0].url
  );
  assert.equal(entry.sourceUrl, url.searchParams.get('ued'));
  assert.equal(entry.locale, 'de');
  assert.equal(entry.approved, true);
  assert.equal(entry.advertiserName, 'REWE');
});

test('activation reaches ingredient, recipe and kitchen options only in Germany; rollback restores ordinary links', () => {
  const options = { enabled: true };
  const guide = getIngredientShoppingGuide(
    'wheat-flour-type-550',
    'de',
    options
  );
  const store = guide.groups[0].stores[0];
  assert.equal(guide.groups[0].region, 'DE');
  assert.equal(store.link.href, registry[0].affiliateUrl);
  assert.equal(store.link.isAffiliate, true);
  assert.match(store.productTitle, /Type 550/);

  const flour = [
    { slug: 'wheat-flour-type-550', name: 'Weizenmehl', quantity: '300 g' },
  ];
  const recipe = getRecipeShoppingIngredients(flour, 'de', options);
  assert.equal(recipe[0].groups[0].stores[0].link.href, store.link.href);
  assert.equal(getApprovedKitchenOptions('de', options).length, 5);
  assert.equal(
    getApprovedKitchenOptions('de', options)[0].ingredient,
    flour[0].slug
  );
  assert.deepEqual(getApprovedKitchenOptions('en', options), []);
  assert.deepEqual(
    getIngredientShoppingGuide(flour[0].slug, 'en', options).groups[0].stores,
    []
  );
  assert.equal(
    JSON.stringify(getRecipeShoppingIngredients(flour, 'en', options)).includes(
      'awin1.com'
    ),
    false
  );

  assert.equal(
    getIngredientShoppingGuide(flour[0].slug, 'de', { enabled: false })
      .groups[0].stores[0].link.href,
    registry[0].sourceUrl
  );
  assert.deepEqual(getApprovedKitchenOptions('de', { enabled: false }), []);
  assert.equal(
    JSON.stringify(
      getRecipeShoppingIngredients(flour, 'de', { enabled: false })
    ).includes('awin1.com'),
    false
  );
  for (const product of Object.values(products).flatMap((langs) =>
    Object.values(langs).flat()
  )) {
    if (registry.some((entry) => entry.sourceUrl === product.url)) continue;
    for (const locale of ['en', 'de']) {
      const [link] = getPurchaseLinks([product.url], locale, options);
      assert.equal(link.isAffiliate, false);
      assert.equal(link.href, product.url);
    }
  }
});
