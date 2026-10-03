const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getIngredientShoppingGuide,
} = require('../lib/ingredientShoppingGuides.cjs');

const sourceUrl = 'https://www.sayweee.com/';
const affiliateUrl = 'https://tracking.example/approved-us-store';
const entry = {
  sourceUrl,
  affiliateUrl,
  locale: 'en',
  advertiserName: 'Weee!',
  approved: true,
};
const asianIngredients = [
  'azukibeanpaste',
  'sb-golden-curry-roux',
  'gochujang',
  'gochugaru',
];

test('US retailers stay in a labeled US group and German retailers stay on German pages', () => {
  for (const slug of asianIngredients) {
    const english = getIngredientShoppingGuide(slug, 'en', {
      entries: [],
      enabled: false,
    });
    assert.ok(
      english.groups.some(
        (group) => group.region === 'local' && group.stores.length === 0
      )
    );
    const us = english.groups.find((group) => group.region === 'US');
    assert.match(us.title, /United States/);
    assert.match(us.note, /ZIP code/);
    assert.equal(us.stores[0].link.href, sourceUrl);
    assert.doesNotMatch(
      JSON.stringify(english),
      /REWE|Deutschland|Germany|asiafoodland/i
    );
    const german = getIngredientShoppingGuide(slug, 'de', {
      entries: [],
      enabled: false,
    });
    assert.deepEqual(
      german.groups.map((group) => group.region),
      ['DE']
    );
    assert.doesNotMatch(JSON.stringify(german), /sayweee|United States/);
  }
});

test('Type 550 uses REWE in Germany and does not imply an Asian retailer sells an equivalent abroad', () => {
  const de = getIngredientShoppingGuide('wheat-flour-type-550', 'de', {
    entries: [],
    enabled: false,
  });
  assert.equal(de.groups[0].stores[0].link.href, 'https://www.rewe.de/');
  const en = getIngredientShoppingGuide('wheat-flour-type-550', 'en', {
    entries: [],
    enabled: false,
  });
  assert.equal(en.groups.flatMap((group) => group.stores).length, 0);
  assert.match(en.groups[0].note, /vary by country/);
});

test('unreviewed ingredients get no invented retailer recommendation', () => {
  for (const slug of ['pizza-dough', 'toString', '__proto__', undefined]) {
    assert.equal(getIngredientShoppingGuide(slug, 'en'), null);
  }
});

test('disabled or unapproved affiliate links never enter the shopping guide props', () => {
  for (const options of [
    { entries: [entry], enabled: false },
    { entries: [{ ...entry, approved: false }], enabled: true },
    { entries: [{ ...entry, locale: 'de' }], enabled: true },
  ]) {
    const guide = getIngredientShoppingGuide('gochujang', 'en', options);
    const link = guide.groups.find((group) => group.region === 'US').stores[0]
      .link;
    assert.equal(link.href, sourceUrl);
    assert.equal(link.isAffiliate, false);
    assert.equal(JSON.stringify(guide).includes(affiliateUrl), false);
  }
});

test('approved links use the existing affiliate resolver and retain the US region', () => {
  const guide = getIngredientShoppingGuide('gochujang', 'en', {
    entries: [entry],
    enabled: true,
  });
  const us = guide.groups.find((group) => group.region === 'US');
  assert.equal(us.stores[0].link.href, affiliateUrl);
  assert.equal(us.stores[0].link.isAffiliate, true);
  const german = getIngredientShoppingGuide('gochujang', 'de', {
    entries: [entry],
    enabled: true,
  });
  assert.equal(JSON.stringify(german).includes(affiliateUrl), false);
});
