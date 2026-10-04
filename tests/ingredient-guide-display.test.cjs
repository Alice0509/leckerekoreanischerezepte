const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const {
  documentToReactComponents,
} = require('@contentful/rich-text-react-renderer');
const {
  getIngredientGuideProfile,
} = require('../lib/ingredientGuideProfiles.cjs');
const {
  getIngredientShoppingGuide,
} = require('../lib/ingredientShoppingGuides.cjs');

const purchaseModule = { exports: {} };
vm.runInNewContext(
  ts.transpileModule(
    fs.readFileSync(
      path.join(__dirname, '../components/PurchaseLink.js'),
      'utf8'
    ),
    {
      compilerOptions: {
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
    }
  ).outputText,
  {
    React,
    module: purchaseModule,
    exports: purchaseModule.exports,
    require: () => ({ label: 'affiliate-label' }),
  }
);

// Render the actual page with framework boundaries stubbed. Keep React and the
// rich-text renderer real so a missing or duplicated description fails here.
const filename = path.join(__dirname, '../pages/ingredients/[slug].js');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: {
    jsx: ts.JsxEmit.React,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,
  },
}).outputText;
const modules = {
  react: React,
  'next/image': (props) =>
    React.createElement('img', { src: props.src, alt: props.alt }),
  'next/link': (props) =>
    React.createElement(
      'a',
      { href: props.href, className: props.className },
      props.children
    ),
  'next/head': (props) =>
    React.createElement(React.Fragment, null, props.children),
  'next-seo': { NextSeo: () => null },
  'next/router': { useRouter: () => ({ asPath: '', isFallback: false }) },
  '../../styles/IngredientDetail.module.css': Object.fromEntries(
    [
      ...fs
        .readFileSync(
          path.join(__dirname, '../styles/IngredientDetail.module.css'),
          'utf8'
        )
        .matchAll(/\.([a-zA-Z][\w]*)/g),
    ].map((match) => [match[1], match[1]])
  ),
  '../../lib/siteUrls': {
    getSeoUrls: ({ locale, path: urlPath }) => ({
      siteOrigin: 'https://example.test',
      canonicalUrl: 'https://example.test' + urlPath,
      alternateUrls: {
        de: 'https://example.test/de',
        en: 'https://example.test/en',
        xDefault: 'https://example.test',
      },
    }),
  },
  '../../lib/ingredientSlugs': {},
  '@contentful/rich-text-react-renderer': { documentToReactComponents },
  '../../lib/generated-ingredient-recipe-index.json': {},
  '../../lib/ingredientDetailRoutes': { isIndexableIngredientSlug: () => true },
  '../../lib/contentfulBuildSnapshot.cjs': {},
  '../../lib/purchaseLinks.cjs': {},
  '../../components/PurchaseLink': purchaseModule.exports.default,
  '../../components/AffiliateDisclosure': () =>
    React.createElement('p', null, 'Affiliate disclosure'),
  '../../lib/ingredientGuideProfiles.cjs': { getIngredientGuideProfile },
  '../../lib/ingredientShoppingGuides.cjs': require('../lib/ingredientShoppingGuides.cjs'),
};
const pageModule = { exports: {} };
vm.runInNewContext(
  compiled,
  {
    exports: pageModule.exports,
    module: pageModule,
    require: (id) => {
      assert.ok(Object.hasOwn(modules, id), `Unexpected dependency ${id}`);
      return modules[id];
    },
    console,
  },
  { filename }
);
const IngredientDetail = pageModule.exports.default;
const description = {
  nodeType: 'document',
  data: {},
  content: [
    {
      nodeType: 'paragraph',
      data: {},
      content: [
        {
          nodeType: 'text',
          value: 'Reviewed ingredient description.',
          marks: [],
          data: {},
        },
      ],
    },
  ],
};
function render(
  slug,
  locale = 'en',
  favoriteProducts = [],
  extra = {},
  pageProps = {}
) {
  return renderToStaticMarkup(
    React.createElement(IngredientDetail, {
      ingredient: {
        id: 'ingredient-id',
        slug,
        name: slug,
        description,
        bild: null,
        ...extra,
      },
      mappedLocale: locale,
      favoriteProducts,
      relatedRecipes: [],
      error: null,
      ...pageProps,
    })
  );
}

test('shop directories render once without personal product notes and keep country labels', () => {
  for (const locale of ['en', 'de']) {
    const shoppingGuide = getIngredientShoppingGuide('gochujang', locale, {
      entries: [],
      enabled: false,
    });
    const html = render('gochujang', locale, [], {}, { shoppingGuide });
    assert.equal(
      (html.match(/id="ingredient-shopping-title"/g) || []).length,
      1
    );
    assert.match(html, /rel="noopener noreferrer"/);
    assert.doesNotMatch(
      html,
      /Affiliate disclosure|affiliate-label|My shopping notes|Meine Einkaufsliste zu/
    );
    if (locale === 'en') {
      assert.match(visible(html), /Your country/);
      assert.match(visible(html), /United States/);
      assert.match(html, /View product at Weee!/);
      assert.doesNotMatch(html, /rewe\.de|asiafoodland\.de/);
    } else {
      assert.match(visible(html), /Deutschland/);
      assert.doesNotMatch(html, /weee\.com/);
    }
  }
});

test('an approved shop directory link renders its advertising label and disclosure without CMS products', () => {
  const shoppingGuide = getIngredientShoppingGuide('gochujang', 'en', {
    enabled: true,
    entries: [
      {
        sourceUrl:
          'https://www.weee.com/en/product/Chung-Jung-One-O-Food-Gochujang/107127',
        affiliateUrl: 'https://tracking.example/approved',
        locale: 'en',
        advertiserName: 'Weee!',
        approved: true,
      },
    ],
  });
  const html = render('gochujang', 'en', [], {}, { shoppingGuide });
  assert.match(html, /rel="sponsored noopener"/);
  assert.match(visible(html), /Ad · Affiliate link/);
  assert.match(html, /Affiliate disclosure/);
  assert.match(visible(html), /United States/);
  assert.match(visible(html), /Chung Jung One O’Food Gochujang · 500 g/);
});

test('both German gochugaru product variants render with distinct destinations and descriptions', () => {
  const shoppingGuide = getIngredientShoppingGuide('gochugaru', 'de', {
    entries: [],
    enabled: false,
  });
  const html = render('gochugaru', 'de', [], {}, { shoppingGuide });
  for (const product of shoppingGuide.groups[0].stores) {
    assert.ok(html.includes(product.link.href));
    assert.ok(visible(html).includes(product.productTitle));
    assert.ok(visible(html).includes(product.note));
  }
  assert.equal((html.match(/Produkt bei Handokmall ansehen/g) || []).length, 2);
});
function visible(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]*>/g, ' ');
}
function faq(html) {
  return [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]))
    .find((data) => data['@type'] === 'FAQPage');
}

test('a CMS description is visible once without any shopping products, in both languages', () => {
  for (const locale of ['en', 'de']) {
    const html = render('wheat-flour-type-550', locale);
    assert.equal(
      visible(html).split('Reviewed ingredient description.').length - 1,
      1
    );
    assert.match(html, /aria-labelledby="ingredient-description-title"/);
    assert.match(html, /overviewGridWithoutImage/);
  }
});

test('multiple shopping products do not duplicate the ingredient guide', () => {
  const products = [1, 2].map((n) => ({
    id: `product-${n}`,
    title: `Shopping product ${n}`,
    memo: '',
    image: null,
    links: [],
  }));
  const html = render('azukibeanpaste', 'en', products);
  assert.equal(
    visible(html).split('Reviewed ingredient description.').length - 1,
    1
  );
  assert.equal(visible(html).split('What is this ingredient?').length - 1, 1);
  for (const product of products) assert.ok(html.includes(product.title));
});

test('ingredient-specific guides render their uses and matching FAQ in both languages', () => {
  for (const slug of [
    'wheat-flour-type-550',
    'azukibeanpaste',
    'sb-golden-curry-roux',
    'sesame-oil',
    'jinganjang',
    'gochugaru',
  ])
    for (const locale of ['en', 'de']) {
      const profile = getIngredientGuideProfile(slug, locale);
      const html = render(slug, locale);
      assert.ok(visible(html).includes(profile.intro));
      for (const use of profile.uses) assert.ok(visible(html).includes(use));
      const questions = faq(html).mainEntity;
      assert.equal(
        questions[0].acceptedAnswer.text,
        profile.buyPlaces.join(', ')
      );
      assert.equal(questions[3].acceptedAnswer.text, profile.storage);
      assert.ok(
        !visible(html).includes(
          locale === 'en' ? 'Banchan and side dishes' : 'Banchan und Beilagen'
        )
      );
    }
});

test('English product guidance is global and flour does not recommend paste storage', () => {
  for (const slug of [
    'wheat-flour-type-550',
    'azukibeanpaste',
    'sb-golden-curry-roux',
    'sesame-oil',
    'jinganjang',
    'gochugaru',
  ]) {
    const english = visible(render(slug));
    assert.doesNotMatch(
      english,
      /Germany|Deutschland|REWE|Edeka|fermented ingredients/i
    );
    const german = visible(render(slug, 'de'));
    assert.match(german, /Deutschland/);
  }
  assert.doesNotMatch(
    visible(render('wheat-flour-type-550')),
    /fridge|refrigerat/i
  );
});

test('an ingredient without rich text uses its guide introduction instead of an empty notice', () => {
  const html = render('wheat-flour-type-550', 'en', [], { description: null });
  assert.match(html, /Type 550 is a white wheat flour/);
  assert.doesNotMatch(html, /No description available/);
});

test('existing ingredient profiles and ordinary shopping links remain usable', () => {
  const html = render('gochujang', 'en', [
    {
      id: 'product',
      title: 'My product',
      links: [{ href: 'https://shop.example/product', isAffiliate: false }],
    },
  ]);
  assert.match(html, /Bibimbap sauce/);
  assert.match(html, /href="https:\/\/shop.example\/product"/);
  assert.doesNotMatch(html, /Affiliate disclosure/);
  assert.equal(
    visible(html).split('Reviewed ingredient description.').length - 1,
    1
  );
});

test('a description containing only a hyperlink remains visible', () => {
  const linked = structuredClone(description);
  linked.content[0].content = [
    {
      nodeType: 'hyperlink',
      data: { uri: 'https://example.test/guide' },
      content: linked.content[0].content,
    },
  ];
  const html = render('azukibeanpaste', 'en', [], { description: linked });
  assert.match(html, /href="https:\/\/example.test\/guide"/);
  assert.equal(
    visible(html).split('Reviewed ingredient description.').length - 1,
    1
  );
});
