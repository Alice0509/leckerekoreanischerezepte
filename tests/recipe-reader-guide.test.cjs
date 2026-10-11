const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  SSAMJANG_RECIPE_ID,
  getRecipeReaderGuide,
} = require('../lib/recipeReaderGuide.cjs');

test('serving guidance and feedback match only the published ssamjang identity', () => {
  for (const id of [
    undefined,
    null,
    '',
    'another-recipe',
    `drafts.${SSAMJANG_RECIPE_ID}`,
  ]) {
    assert.equal(getRecipeReaderGuide(id, 'en'), null);
    assert.equal(getRecipeReaderGuide(id, 'de'), null);
  }
  assert.ok(getRecipeReaderGuide(SSAMJANG_RECIPE_ID, 'en'));
  assert.ok(getRecipeReaderGuide(SSAMJANG_RECIPE_ID, 'de'));
});

test('both locales have complete guidance, safe internal links and an optional-photo question', () => {
  for (const locale of ['en', 'de']) {
    const guide = getRecipeReaderGuide(SSAMJANG_RECIPE_ID, locale);
    for (const key of [
      'title',
      'intro',
      'detailsTitle',
      'feedback',
      'feedbackButton',
    ]) {
      assert.equal(typeof guide[key], 'string');
      assert.ok(guide[key].trim());
    }
    assert.equal(guide.sections.length, 3);
    assert.ok(guide.sections.every(({ title, text }) => title && text));
    assert.deepEqual(
      guide.links.map(({ href }) => href),
      ['/ingredients/doenjang', '/ingredients/gochujang']
    );
  }
  assert.match(
    getRecipeReaderGuide(SSAMJANG_RECIPE_ID, 'en').feedback,
    /No photo is needed/
  );
  assert.match(
    getRecipeReaderGuide(SSAMJANG_RECIPE_ID, 'de').feedback,
    /Ein Foto ist nicht nötig/
  );
});

test('fallback locale is English and callers cannot mutate shared copy', () => {
  const original = getRecipeReaderGuide(SSAMJANG_RECIPE_ID, 'en');
  const changed = getRecipeReaderGuide(SSAMJANG_RECIPE_ID, 'en');
  changed.links[0].href = 'https://example.com';
  changed.sections[0].text = 'changed';
  assert.deepEqual(getRecipeReaderGuide(SSAMJANG_RECIPE_ID, 'en'), original);
  assert.deepEqual(
    getRecipeReaderGuide(SSAMJANG_RECIPE_ID, undefined),
    original
  );
});

test('guide remains collapsed, follows instructions, and comments remain click-to-load', () => {
  const read = (file) =>
    fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const guide = read('components/RecipeReaderGuide.js');
  const page = read('pages/recipes/[slug].js');
  const comments = read('components/DisqusComments.js');
  assert.match(guide, /<details className=/);
  assert.doesNotMatch(guide, /<details[^>]*\bopen(?:\s|[=>])/);
  assert.ok(
    page.indexOf('<RecipeReaderGuide') > page.lastIndexOf('id="instructions"')
  );
  assert.match(comments, /useState\(false\)/);
  assert.match(comments, /\{isOpen && \(\s*<DiscussionEmbed/);
  assert.match(comments, /if \(!disqusShortname/);
  assert.match(comments, /readerGuide\?\.feedback/);
  assert.match(comments, /'Open comments'/);
});
