const test = require('node:test');
const assert = require('node:assert/strict');
const registry = require('../lib/affiliate-links.json');
const products = require('../lib/ingredientShoppingProducts.json');
const { getPurchaseLinks } = require('../lib/purchaseLinks.cjs');
const {
  getIngredientShoppingGuide,
} = require('../lib/ingredientShoppingGuides.cjs');
const { getRecipeShoppingIngredients } = require('../lib/recipeShopping.cjs');
const { getApprovedKitchenOptions } = require('../lib/kitchenPicks.cjs');

const expected = [
  [
    'gochujang',
    'https://www.asiafoodland.de/gochujang-koreanische-chilipaste-red-pepper-500-g.html',
  ],
  [
    'sesame-oil',
    'https://www.asiafoodland.de/food/oel-essig-fischsauce/oele-fette/ottogi-koreanisches-sesamoel-100-pur-160-ml.html',
  ],
];

test('the two issued Asiafoodland URLs identify the correct publisher and exact existing products', () => {
  const entries = registry.filter(
    (entry) => entry.advertiserName === 'Asiafoodland'
  );
  assert.equal(entries.length, 2);
  for (const [slug, source] of expected) {
    const entry = entries.find((entry) => entry.sourceUrl === source);
    assert.ok(entry);
    assert.ok(products[slug].de.some((product) => product.url === source));
    assert.equal(entry.locale, 'de');
    assert.equal(entry.approved, true);
    const url = new URL(entry.affiliateUrl);
    assert.equal(url.origin, 'https://www.awin1.com');
    assert.equal(url.pathname, '/cread.php');
    assert.equal(url.searchParams.get('awinmid'), '15939');
    assert.equal(url.searchParams.get('awinaffid'), '3113363');
    assert.equal(url.searchParams.get('ued'), source);
  }
});

test('Asiafoodland activation reaches German ingredients, recipe shopping and kitchen picks; English and rollback keep ordinary links', () => {
  const options = { enabled: true };
  const kitchen = getApprovedKitchenOptions('de', options).filter(
    (item) => item.link.advertiserName === 'Asiafoodland'
  );
  assert.equal(kitchen.length, 2);
  for (const [slug, source] of expected) {
    const entry = registry.find(
      (entry) => entry.sourceUrl === source && entry.locale === 'de'
    );
    const guide = getIngredientShoppingGuide(slug, 'de', options);
    const group = guide.groups.find((group) =>
      group.stores.some((store) => store.sourceUrl === source)
    );
    assert.ok(group);
    assert.equal(group.region, 'DE');
    const store = group.stores.find((store) => store.sourceUrl === source);
    assert.equal(store.link.href, entry.affiliateUrl);
    assert.equal(store.link.isAffiliate, true);
    assert.equal(store.link.advertiserName, 'Asiafoodland');
    const recipe = getRecipeShoppingIngredients(
      [{ slug, name: slug, quantity: '1' }],
      'de',
      options
    );
    assert.ok(
      recipe
        .flatMap((item) => item.groups)
        .flatMap((group) => group.stores)
        .some((store) => store.link.href === entry.affiliateUrl)
    );
    assert.ok(
      kitchen.some(
        (item) =>
          item.ingredient === slug && item.link.href === entry.affiliateUrl
      )
    );
    const [english] = getPurchaseLinks([source], 'en', options);
    assert.equal(english.href, source);
    assert.equal(english.isAffiliate, false);
    assert.equal(
      JSON.stringify(getIngredientShoppingGuide(slug, 'en', options)).includes(
        'awinmid=15939'
      ),
      false
    );
    assert.equal(
      JSON.stringify(
        getRecipeShoppingIngredients([{ slug, name: slug }], 'en', options)
      ).includes('awinmid=15939'),
      false
    );
    const rollback = getIngredientShoppingGuide(slug, 'de', { enabled: false });
    const ordinary = rollback.groups
      .flatMap((group) => group.stores)
      .find((store) => store.sourceUrl === source);
    assert.equal(ordinary.link.href, source);
    assert.equal(ordinary.link.isAffiliate, false);
    const [unapproved] = getPurchaseLinks([source], 'de', {
      enabled: true,
      entries: [{ ...entry, approved: false }],
    });
    assert.equal(unapproved.href, source);
    assert.equal(unapproved.isAffiliate, false);
  }
  assert.deepEqual(getApprovedKitchenOptions('de', { enabled: false }), []);
  assert.deepEqual(getApprovedKitchenOptions('en', options), []);
});
