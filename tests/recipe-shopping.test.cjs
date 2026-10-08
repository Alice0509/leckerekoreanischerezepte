const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { getRecipeShoppingIngredients } = require('../lib/recipeShopping.cjs');
const products = require('../lib/ingredientShoppingProducts.json');

const ingredients = [
  { slug: 'gochujang', name: 'Gochujang', quantity: '2 parts' },
  { slug: 'gochugaru', name: 'Gochugaru', quantity: '2 parts' },
  { slug: 'sesame-oil', name: 'Sesame oil', quantity: '1 part' },
  { slug: 'jinganjang', name: 'Jin soy sauce', quantity: '2 parts' },
  { slug: 'garlic', name: 'Garlic', quantity: '2 parts' },
];
const source = products.gochujang.en[0].url;
const entry = {
  sourceUrl: source,
  affiliateUrl: 'https://tracking.example/approved',
  advertiserName: 'Weee!',
  locale: 'en',
  approved: true,
};

test('recipe shopping uses only actual supported ingredients, deduplicates guides and preserves original amounts', () => {
  const before = JSON.stringify(ingredients);
  const selected = getRecipeShoppingIngredients(
    [...ingredients, ingredients[0], null, { slug: '__proto__' }],
    'en',
    { entries: [], enabled: false }
  );
  assert.deepEqual(
    selected.map((item) => item.slug),
    ['gochujang', 'gochugaru', 'sesame-oil', 'jinganjang']
  );
  assert.equal(JSON.stringify(ingredients), before);
  assert.ok(!selected.some((item) => item.slug === 'sb-golden-curry-roux'));
  assert.deepEqual(getRecipeShoppingIngredients(undefined, 'en'), []);
  assert.deepEqual(
    getRecipeShoppingIngredients([{ slug: 'garlic' }], 'en'),
    []
  );
});

test('country-specific products remain separate and missing US products keep the local ingredient guide', () => {
  const english = getRecipeShoppingIngredients(ingredients, 'en', {
    entries: [],
    enabled: false,
  });
  const german = getRecipeShoppingIngredients(ingredients, 'de', {
    entries: [],
    enabled: false,
  });
  assert.ok(
    english
      .flatMap((item) => item.groups)
      .every((group) => group.region === 'US')
  );
  assert.ok(
    german
      .flatMap((item) => item.groups)
      .every((group) => group.region === 'DE')
  );
  assert.equal(
    english.find((item) => item.slug === 'jinganjang').groups.length,
    0
  );
  assert.equal(
    german.find((item) => item.slug === 'jinganjang').groups[0].stores[0].name,
    'Handokmall'
  );
  assert.equal(JSON.stringify(english).includes('handokmall.de'), false);
});

test('disabled, unapproved, wrong-locale and wrong-source tracking links never enter recipe props', () => {
  for (const options of [
    { entries: [entry], enabled: false },
    { entries: [{ ...entry, approved: false }], enabled: true },
    { entries: [{ ...entry, locale: 'de' }], enabled: true },
    {
      entries: [{ ...entry, sourceUrl: 'https://www.weee.com/other' }],
      enabled: true,
    },
  ]) {
    const result = getRecipeShoppingIngredients(ingredients, 'en', options);
    assert.equal(result[0].groups[0].stores[0].link.href, source);
    assert.equal(JSON.stringify(result).includes('tracking.example'), false);
  }
  const approved = getRecipeShoppingIngredients(ingredients, 'en', {
    entries: [entry],
    enabled: true,
  });
  assert.equal(approved[0].groups[0].region, 'US');
  assert.equal(approved[0].groups[0].stores[0].name, 'Weee!');
  assert.equal(approved[0].groups[0].stores[0].link.href, entry.affiliateUrl);
});

function compile(file, dependencies) {
  const mod = { exports: {} };
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  }).outputText;
  vm.runInNewContext(js, {
    React,
    exports: mod.exports,
    module: mod,
    require: (id) => {
      assert.ok(
        Object.hasOwn(dependencies, id),
        `Unexpected dependency: ${id}`
      );
      return dependencies[id];
    },
  });
  return mod.exports.default;
}
const PurchaseLink = compile('components/PurchaseLink.js', {
  '../styles/PurchaseLink.module.css': {},
});
const AffiliateDisclosure = compile('components/AffiliateDisclosure.js', {});
const Shopping = compile('components/RecipeIngredientShopping.js', {
  'next/link': (props) =>
    React.createElement('a', { href: props.href }, props.children),
  './PurchaseLink': PurchaseLink,
  './AffiliateDisclosure': AffiliateDisclosure,
  '../styles/RecipeIngredientShopping.module.css': {},
});
function render(locale, options, input = ingredients) {
  return renderToStaticMarkup(
    React.createElement(Shopping, {
      locale,
      ingredients: getRecipeShoppingIngredients(input, locale, options),
    })
  );
}

test('localized panels start closed, show exact products and regions, and retain each ingredient guide', () => {
  for (const locale of ['en', 'de']) {
    const html = render(locale, { entries: [], enabled: false });
    assert.match(html, /<details[^>]*id="recipe-ingredient-shopping"/);
    assert.doesNotMatch(
      html,
      /\bopen=|sponsored|tracking.example|Advertisement:|Werbung:/
    );
    assert.match(
      html,
      locale === 'en'
        ? /Find ingredients for this recipe/
        : /Zutaten für dieses Rezept finden/
    );
    assert.match(html, locale === 'en' ? /United States/ : /Deutschland/);
    for (const slug of ['gochujang', 'gochugaru', 'sesame-oil', 'jinganjang']) {
      assert.match(
        html,
        new RegExp(`href="/ingredients/${slug}#ingredient-shopping"`)
      );
    }
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
    assert.match(
      html,
      locale === 'en'
        ? /View product at Weee!/
        : /Produkt bei Asiafoodland ansehen/
    );
    assert.doesNotMatch(html, /Golden Curry|photo shown above|Link 1/);
  }
});

test('mixed approved and ordinary recipe products disclose advertising individually without changing shop or region', () => {
  const html = render('en', { entries: [entry], enabled: true });
  assert.equal((html.match(/Ad · Affiliate link/g) || []).length, 1);
  assert.equal((html.match(/Advertisement:/g) || []).length, 1);
  assert.match(html, /rel="sponsored noopener"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /United States/);
  assert.match(html, /View product at Weee!/);
  assert.match(html, /href="https:\/\/tracking.example\/approved"/);
});

test('recipes without supported ingredients show no empty shopping panel, and curry shows only its actual product', () => {
  assert.equal(
    render('en', { entries: [], enabled: false }, [{ slug: 'garlic' }]),
    ''
  );
  assert.equal(
    renderToStaticMarkup(React.createElement(Shopping, { locale: 'en' })),
    ''
  );
  const html = render('en', { entries: [], enabled: false }, [
    { slug: 'sb-golden-curry-roux', name: 'Golden Curry' },
  ]);
  assert.match(html, /Golden Curry/);
  assert.doesNotMatch(html, /Gochujang|Sesame oil|Jin soy sauce/);
});
