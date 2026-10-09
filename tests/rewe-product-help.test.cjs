const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { getReweProductHelp } = require('../lib/reweProductHelp.cjs');
const {
  getIngredientShoppingGuide,
} = require('../lib/ingredientShoppingGuides.cjs');
const { getApprovedKitchenOptions } = require('../lib/kitchenPicks.cjs');
const { loadReweProductHelp } = require('./helpers/rewe-product-help.cjs');
const store = getIngredientShoppingGuide('paniermehl', 'de', { enabled: true })
  .groups[0].stores[0];

test('REWE fallback retains the exact ordinary destination for all six products without changing issued affiliate links', () => {
  for (const item of getApprovedKitchenOptions('de', { enabled: true })) {
    const help = getReweProductHelp(item, 'de');
    assert.equal(help.webUrl, new URL(item.link.href).searchParams.get('ued'));
    assert.equal(help.productTitle, item.productTitle);
    assert.equal(item.link.isAffiliate, true);
  }
  const { getRecipeShoppingIngredients } = require('../lib/recipeShopping.cjs');
  const [recipeIngredient] = getRecipeShoppingIngredients(
    [{ slug: 'paniermehl', name: 'Paniermehl' }],
    'de',
    { enabled: true }
  );
  const recipeStore = recipeIngredient.groups[0].stores[0];
  assert.equal(getReweProductHelp(recipeStore, 'de').webUrl, store.sourceUrl);
  assert.equal(recipeStore.variantLabel, store.variantLabel);
  assert.match(store.variantLabel, /Koreanisches.*Samlip/);
  assert.match(store.note, /Samlip.*Zutatenfoto/);
});

test('unrelated retailers, unsafe or decorated addresses and English pages get no REWE help', () => {
  assert.equal(getReweProductHelp(store, 'en'), null);
  for (const sourceUrl of [
    undefined,
    'javascript:alert(1)',
    'https://www.rewe.de.evil.test/shop/p/name/123',
    'https://user@www.rewe.de/shop/p/name/123',
    'http://www.rewe.de/shop/p/name/123',
    'https://www.rewe.de/',
    store.sourceUrl + '?affiliate=other',
    store.sourceUrl + '#app',
    store.link.href,
  ]) {
    assert.equal(getReweProductHelp({ ...store, sourceUrl }, 'de'), null);
  }
});

test('server rendering keeps help collapsed and gives a manually selectable product address without adding another tracking link', () => {
  const Component = loadReweProductHelp();
  const html = renderToStaticMarkup(
    React.createElement(Component, { store, locale: 'de' })
  );
  assert.match(html, /<details/);
  assert.doesNotMatch(html, /<details[^>]*\bopen\b|<a\b|awin1\.com|<script/);
  assert.match(html, /readonly=""/);
  assert.match(html, /kein Affiliate-Link/);
  assert.match(html, /value="https:\/\/www\.rewe\.de\/shop\/p\/samlip-panko/);
  assert.equal(
    renderToStaticMarkup(
      React.createElement(Component, { store, locale: 'en' })
    ),
    ''
  );
});

function interaction(navigator) {
  const updates = [];
  const Component = loadReweProductHelp({
    navigator,
    react: {
      ...React,
      useId: () => 'product-address',
      useState: () => ['', (value) => updates.push(value)],
    },
  });
  const tree = Component({ store, locale: 'de' });
  const elements = [];
  function visit(node) {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!React.isValidElement(node)) return;
    elements.push(node);
    visit(node.props.children);
  }
  visit(tree);
  return {
    updates,
    buttons: elements.filter((node) => node.type === 'button'),
    input: elements.find((node) => node.type === 'input'),
  };
}

test('copy actions write only the chosen address or product name and report success after clipboard completion', async () => {
  const writes = [];
  const ui = interaction({
    clipboard: { writeText: async (value) => writes.push(value) },
  });
  await ui.buttons[0].props.onClick();
  await ui.buttons[1].props.onClick();
  assert.deepEqual(writes, [store.sourceUrl, store.productTitle]);
  assert.match(ui.updates[0], /Webadresse kopiert/);
  assert.match(ui.updates[1], /Produktname kopiert/);
  assert.ok(writes.every((value) => !value.includes('awin1.com')));
});

test('unavailable or denied clipboard reports failure and leaves the real address available to select manually', async () => {
  for (const navigator of [
    {},
    {
      clipboard: {
        writeText: async () => {
          throw new Error('denied');
        },
      },
    },
  ]) {
    const ui = interaction(navigator);
    await ui.buttons[0].props.onClick();
    assert.match(ui.updates[0], /Kopieren nicht möglich/);
    assert.equal(ui.input.props.value, store.sourceUrl);
    let selected = false;
    ui.input.props.onFocus({
      target: {
        select() {
          selected = true;
        },
      },
    });
    assert.equal(selected, true);
  }
});
