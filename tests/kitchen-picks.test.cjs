const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
  getKitchenPickContext,
  getKitchenPickLinks,
  getApprovedKitchenOptions,
} = require('../lib/kitchenPicks.cjs');

const source =
  'https://handokmall.de/en/sempio-soy-sauce-jin-gold-f3-860ml/12420';
const entry = {
  sourceUrl: source,
  affiliateUrl: 'https://tracking.example/approved',
  advertiserName: 'Handokmall',
  locale: 'en',
  approved: true,
};

test('approval changes a destination without changing original shop identity or country', () => {
  const [approved] = getKitchenPickLinks([source], 'en', {
    entries: [entry],
    enabled: true,
  });
  assert.equal(approved.href, entry.affiliateUrl);
  assert.equal(approved.isAffiliate, true);
  assert.equal(approved.shopName, 'Handokmall');
  assert.equal(approved.region, 'DE');
  for (const options of [
    { entries: [entry], enabled: false },
    { entries: [{ ...entry, approved: false }], enabled: true },
    { entries: [{ ...entry, locale: 'de' }], enabled: true },
  ]) {
    const [ordinary] = getKitchenPickLinks([source], 'en', options);
    assert.equal(ordinary.href, source);
    assert.equal(ordinary.isAffiliate, false);
    assert.equal(JSON.stringify(ordinary).includes('tracking.example'), false);
  }
});

test('unknown shops receive no invented delivery country and unsafe links are omitted', () => {
  const links = getKitchenPickLinks(
    [
      'javascript:alert(1)',
      'https://user:password@shop.example/product',
      'https://shop.example/product',
    ],
    'en',
    { entries: [], enabled: false }
  );
  assert.equal(links.length, 1);
  assert.equal(links[0].region, 'other');
  assert.equal(links[0].shopName, 'shop.example');
});

test('only curated product IDs receive context and missing published recipes fail clearly', () => {
  for (const id of ['unknown', 'toString', '__proto__'])
    assert.equal(getKitchenPickContext(id, 'en', {}), null);
  assert.throws(
    () => getKitchenPickContext('3fSQy6VaENqhbkX8XkaO5', 'en', {}),
    /Missing published kitchen pick recipe/
  );
  const context = getKitchenPickContext('3fSQy6VaENqhbkX8XkaO5', 'en', {
    'chat-recipe-bibim-noodle-sauce': {
      slug: 'bibim-noodle-sauce',
      titel: 'Bibim sauce',
    },
  });
  assert.equal(context.recipe.slug, 'bibim-noodle-sauce');
  assert.match(context.note, /Jin Gold F3.*Jin S/);
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
  return mod.exports;
}
const PurchaseLink = compile('components/PurchaseLink.js', {
  '../styles/PurchaseLink.module.css': {},
}).default;
const Gallery = compile('pages/gallery.js', {
  '../lib/contentfulBuildSnapshot.cjs': {},
  '../lib/kitchenPicks.cjs': require('../lib/kitchenPicks.cjs'),
  'next/link': (props) =>
    React.createElement('a', { href: props.href }, props.children),
  '../components/PurchaseLink': PurchaseLink,
  '../components/ReweProductHelp':
    require('./helpers/rewe-product-help.cjs').loadReweProductHelp(),
  '../components/AffiliateDisclosure': () =>
    React.createElement('p', null, 'Affiliate disclosure'),
  'next/image': (props) =>
    React.createElement('img', { src: props.src, alt: props.alt }),
  '../styles/Gallery.module.css': {
    notes: 'notes',
    kitchenPhotos: 'kitchenPhotos',
  },
  'next-seo': { NextSeo: () => null },
  '../lib/siteUrls': {
    getSeoUrls: () => ({
      canonicalUrl: 'https://example.test/gallery',
      alternateUrls: {},
    }),
  },
  react: React,
});
function render(locale, options) {
  return renderToStaticMarkup(
    React.createElement(Gallery.default, {
      locale,
      favorites: [
        {
          id: 'personal-note',
          title: 'Exact product variant',
          memo: 'Existing personal experience.',
          image: null,
          context: null,
          links: getKitchenPickLinks(
            [source, 'https://goasia.net/en/soy-sauce/example.html'],
            locale,
            options
          ),
        },
      ],
      galleryItems: [{ id: 'photo', title: 'Existing photo', img: null }],
    })
  );
}
test('both pages retain personal notes and photos in closed sections with labeled shopping regions', () => {
  for (const locale of ['en', 'de']) {
    const html = render(locale, { entries: [], enabled: false });
    assert.match(html, /Existing personal experience/);
    assert.match(html, /Existing photo/);
    assert.match(html, /href="\/korean-pantry"/);
    assert.match(html, /href="\/korean-kitchen-tools"/);
    assert.match(html, /href="\/cooking-plan"/);
    assert.match(
      html,
      locale === 'en' ? /Product links: Germany/ : /Produktlinks: Deutschland/
    );
    assert.match(html, /Handokmall/);
    assert.match(html, /rel="noopener noreferrer"/);
    assert.doesNotMatch(html, /\bopen="|Affiliate disclosure|Link 1|sponsored/);
    assert.match(html, /<details class="[^"]*kitchenPhotos">/);
  }
});

test('mixed affiliate and ordinary links keep individual labels and disclose only actual advertising', () => {
  const approved = render('en', { entries: [entry], enabled: true });
  assert.match(approved, /Product links: Germany/);
  assert.match(approved, /rel="sponsored noopener"/);
  assert.match(approved, /Ad · Affiliate link/);
  assert.match(approved, /Affiliate disclosure/);
  assert.equal((approved.match(/Ad · Affiliate link/g) || []).length, 1);
  assert.match(approved, /rel="noopener noreferrer"/);
  assert.match(approved, /View product at Handokmall/);
  assert.doesNotMatch(approved, /These links are not ads/);
});

test('the hub only gathers curated exact-product links after approval and activation, with country preserved', () => {
  const productEntry = {
    ...entry,
    sourceUrl:
      'https://www.weee.com/en/product/Chung-Jung-One-O-Food-Gochujang/107127',
    advertiserName: 'Weee!',
  };
  for (const options of [
    { entries: [productEntry], enabled: false },
    { entries: [{ ...productEntry, approved: false }], enabled: true },
  ]) {
    assert.deepEqual(getApprovedKitchenOptions('en', options), []);
  }
  const products = getApprovedKitchenOptions('en', {
    entries: [productEntry],
    enabled: true,
  });
  assert.equal(products.length, 1);
  assert.equal(products[0].region, 'United States');
  assert.equal(products[0].ingredient, 'gochujang');
  assert.equal(products[0].link.href, productEntry.affiliateUrl);
  assert.deepEqual(
    getApprovedKitchenOptions('de', { entries: [productEntry], enabled: true }),
    []
  );
  const html = renderToStaticMarkup(
    React.createElement(Gallery.default, {
      locale: 'en',
      favorites: [],
      galleryItems: [],
      productOptions: products,
    })
  );
  assert.match(html, /Shopping options from the ingredient guides/);
  assert.match(html, /separate from my personal use notes/);
  assert.match(html, /United States/);
  assert.match(html, /Ad · Affiliate link/);
  assert.match(html, /href="\/ingredients\/gochujang"/);
  assert.doesNotMatch(html, /<p>Weee! · (?:Germany|Deutschland)<\/p>/);
});
