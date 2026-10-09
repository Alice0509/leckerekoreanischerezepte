const test = require('node:test');
const assert = require('node:assert/strict');
const registry = require('../lib/affiliate-links.json');
const products = require('../lib/ingredientShoppingProducts.json');
const data = require('../lib/generated-cooking-plan-data.json');
const {
  getIngredientGuideProfile,
} = require('../lib/ingredientGuideProfiles.cjs');
const {
  getIngredientShoppingGuide,
} = require('../lib/ingredientShoppingGuides.cjs');
const { getRecipeShoppingIngredients } = require('../lib/recipeShopping.cjs');
const { getApprovedKitchenOptions } = require('../lib/kitchenPicks.cjs');

// Match the four URLs supplied by the publisher, independently of the registry.
const issued = {
  sugar:
    'https://www.awin1.com/cread.php?awinmid=11652&awinaffid=3113363&ued=https%3A%2F%2Fwww.rewe.de%2Fshop%2Fp%2Fja-raffinade-zucker-1kg%2F5249473',
  'cooking-oil':
    'https://www.awin1.com/cread.php?awinmid=11652&awinaffid=3113363&ued=https%3A%2F%2Fwww.rewe.de%2Fshop%2Fp%2Fja-reines-rapsoel-1l%2F6801447',
  apfelessig:
    'https://www.awin1.com/cread.php?awinmid=11652&awinaffid=3113363&ued=https%3A%2F%2Fwww.rewe.de%2Fshop%2Fp%2Frewe-beste-wahl-apfelessig-klar-1l%2F8331440',
  paniermehl:
    'https://www.awin1.com/cread.php?awinmid=11652&awinaffid=3113363&ued=https%3A%2F%2Fwww.rewe.de%2Fshop%2Fp%2Frewe-beste-wahl-panko-paniermehl-140g%2F2666357',
};

test('each issued pantry link keeps the exact product, publisher, advertiser and German scope', () => {
  for (const [slug, href] of Object.entries(issued)) {
    const url = new URL(href);
    const product = products[slug].de[0];
    const entries = registry.filter((entry) => entry.sourceUrl === product.url);
    assert.equal(entries.length, 1);
    assert.deepEqual(entries[0], {
      sourceUrl: url.searchParams.get('ued'),
      affiliateUrl: href,
      locale: 'de',
      advertiserName: 'REWE',
      approved: true,
    });
    assert.equal(url.searchParams.get('ued'), product.url);
    assert.equal(url.searchParams.get('awinmid'), '11652');
    assert.equal(url.searchParams.get('awinaffid'), '3113363');
    assert.equal(new URL(product.url).search, '');
    assert.ok(product.productTitle.length > 10 && product.note.length > 30);
    const guide = getIngredientShoppingGuide(slug, 'de', { enabled: true });
    assert.equal(guide.groups[0].stores[0].link.href, href);
    assert.equal(guide.groups[0].stores[0].link.isAffiliate, true);
    assert.deepEqual(
      guide.groups.map((group) => group.region),
      ['DE']
    );
    assert.match(guide.groups[0].note, /Supermarkt/);
  }
});

test('actual published recipe ingredients drive pantry links without changing amounts or substituting other ingredients', async () => {
  const { hasIngredientDetailPage } = await import(
    '../lib/ingredientDetailRoutes.js'
  );
  const covered = new Set();
  for (const recipe of Object.values(data.de.recipesById)) {
    const before = JSON.stringify(recipe.ingredients);
    const result = getRecipeShoppingIngredients(
      recipe.ingredients.filter((item) =>
        hasIngredientDetailPage({ slug: item.slug, description: null })
      ),
      'de',
      {
        enabled: true,
      }
    );
    const expected = recipe.ingredients.filter((item) =>
      Object.hasOwn(issued, item.slug)
    );
    for (const ingredient of expected) {
      const selected = result.find((item) => item.slug === ingredient.slug);
      assert.equal(
        selected.groups[0].stores[0].link.href,
        issued[ingredient.slug]
      );
      covered.add(ingredient.slug);
    }
    for (const item of result.filter((item) =>
      Object.hasOwn(issued, item.slug)
    )) {
      assert.ok(expected.some((ingredient) => ingredient.slug === item.slug));
    }
    assert.equal(JSON.stringify(recipe.ingredients), before);
  }
  assert.deepEqual([...covered].sort(), Object.keys(issued).sort());
  for (const slug of [
    'sesame-oil',
    'oliveoil',
    'brown-sugar-baking-sugar',
    'powdered-sugar',
    'cornstarch',
    'staerkemehl',
  ]) {
    const result = getRecipeShoppingIngredients([{ slug }], 'de', {
      enabled: true,
    });
    assert.ok(
      !Object.values(issued).some((href) =>
        JSON.stringify(result).includes(href)
      )
    );
  }
});

test('English guides retain local shopping advice and never inherit German retailer or affiliate links', () => {
  for (const slug of Object.keys(issued)) {
    const guide = getIngredientShoppingGuide(slug, 'en', { enabled: true });
    assert.deepEqual(
      guide.groups.map((group) => group.region),
      ['local']
    );
    assert.equal(guide.groups[0].stores.length, 0);
    assert.match(guide.groups[0].note, /local supermarket/);
    assert.doesNotMatch(
      JSON.stringify(guide),
      /REWE|rewe\.de|awin1\.com|Deutschland/
    );
  }
  for (const recipe of Object.values(data.en.recipesById)) {
    assert.doesNotMatch(
      JSON.stringify(
        getRecipeShoppingIngredients(recipe.ingredients, 'en', {
          enabled: true,
        })
      ),
      /awin1\.com|rewe\.de/
    );
  }
  const hub = getApprovedKitchenOptions('de', { enabled: true });
  assert.deepEqual(
    hub.map((item) => item.ingredient).sort(),
    ['wheat-flour-type-550', ...Object.keys(issued)].sort()
  );
  assert.deepEqual(getApprovedKitchenOptions('en', { enabled: true }), []);
});

test('rollback and missing, unapproved, wrong-locale or different-product approval restore only ordinary product links', () => {
  for (const [slug, href] of Object.entries(issued)) {
    const product = products[slug].de[0];
    const entry = registry.find((item) => item.affiliateUrl === href);
    for (const options of [
      { enabled: false },
      { enabled: true, entries: [] },
      { enabled: true, entries: [{ ...entry, approved: false }] },
      { enabled: true, entries: [{ ...entry, locale: 'en' }] },
      {
        enabled: true,
        entries: [{ ...entry, sourceUrl: 'https://www.rewe.de/' }],
      },
    ]) {
      const guide = getIngredientShoppingGuide(slug, 'de', options);
      assert.deepEqual(guide.groups[0].stores[0].link, {
        href: product.url,
        isAffiliate: false,
        advertiserName: '',
      });
      assert.doesNotMatch(
        JSON.stringify(getRecipeShoppingIngredients([{ slug }], 'de', options)),
        /awin1\.com/
      );
    }
  }
  assert.deepEqual(getApprovedKitchenOptions('de', { enabled: false }), []);
});

test('all four ingredient routes have useful localized guides even when the CMS description is empty', async () => {
  const { hasIngredientDetailPage, isIndexableIngredientSlug } = await import(
    '../lib/ingredientDetailRoutes.js'
  );
  for (const slug of Object.keys(issued)) {
    assert.equal(hasIngredientDetailPage({ slug, description: null }), true);
    assert.equal(isIndexableIngredientSlug(slug), false);
    for (const locale of ['de', 'en']) {
      const guide = getIngredientGuideProfile(slug, locale);
      assert.ok(guide.headline && guide.intro.length > 80);
      assert.ok(
        guide.uses.length >= 2 &&
          guide.tips.length >= 2 &&
          guide.substitute &&
          guide.storage
      );
      if (locale === 'en')
        assert.doesNotMatch(JSON.stringify(guide), /Deutschland|Germany|REWE/);
    }
  }
});
