const test = require('node:test');
const assert = require('node:assert/strict');
const {
  orderedRecipeSteps,
  recipeSearchDetails,
  serializeRecipeSchema,
} = require('../lib/recipeSearchDetails.cjs');
const { firstPublicationDate } = require('../lib/recipeFreshness.cjs');

const toPlainText = (value) => (typeof value === 'string' ? value.trim() : '');
const base = {
  canonicalUrl: 'https://www.hansikyoung.com/recipes/bibim-noodle-sauce',
  locale: 'en',
  toPlainText,
};

test('one known overall duration is never duplicated as a separate preparation or cooking duration', () => {
  const details = recipeSearchDetails({
    ...base,
    preparationTime: 30,
    servings: 4,
  });
  assert.equal(details.totalTime, 'PT30M');
  assert.equal(details.prepTime, undefined);
  assert.equal(details.cookTime, undefined);
  assert.equal(details.recipeYield, '4 servings');
  assert.equal(
    recipeSearchDetails({ ...base, locale: 'de', servings: 2 }).recipeYield,
    '2 Portionen'
  );
  for (const time of [null, '', '20–30', -1, 0, 0.1, Infinity]) {
    assert.equal(
      recipeSearchDetails({ ...base, preparationTime: time }).totalTime,
      undefined
    );
  }
});

test('publication stays fixed through edits and migration timestamps never become publication dates', () => {
  const firstPublishedAt = firstPublicationDate({
    _id: 'chat-recipe-bibim-noodle-sauce',
    _createdAt: '2026-10-04T09:36:34Z',
  });
  const details = recipeSearchDetails({
    ...base,
    firstPublishedAt,
    updatedDate: '2026-10-04T13:16:08Z',
  });
  assert.equal(details.datePublished, '2026-10-04T09:36:34.000Z');
  assert.equal(details.dateModified, '2026-10-04T13:16:08.000Z');
  const legacy = firstPublicationDate({
    _id: 'legacy',
    legacyContentfulId: 'old',
    _createdAt: '2026-10-02T00:00:00Z',
  });
  assert.equal(
    recipeSearchDetails({
      ...base,
      firstPublishedAt: legacy,
      updatedDate: '2026-10-04',
    }).datePublished,
    undefined
  );
  for (const date of ['invalid', '2026-02-31', null]) {
    assert.equal(
      recipeSearchDetails({ ...base, firstPublishedAt: date }).datePublished,
      undefined
    );
  }
});

test('sparse, unsorted and duplicate step numbers produce unique anchors in the same order as the visible instructions', () => {
  const steps = [
    { stepNumber: 3, description: 'Serve.' },
    { stepNumber: 1, description: 'Mix.' },
    null,
    { stepNumber: 2, description: '  ' },
    { stepNumber: 1, description: 'Taste.' },
  ];
  const before = structuredClone(steps);
  const visible = orderedRecipeSteps(steps, toPlainText);
  const en = recipeSearchDetails({ ...base, steps });
  assert.deepEqual(
    en.recipeInstructions.map((step) => step.text),
    visible.map((step) => step.description)
  );
  assert.deepEqual(
    en.recipeInstructions.map((step) => step.url),
    [1, 2, 3].map((n) => `${base.canonicalUrl}#step-${n}`)
  );
  assert.deepEqual(steps, before);
  const de = recipeSearchDetails({
    ...base,
    locale: 'de',
    canonicalUrl:
      'https://www.leckere-koreanische-rezepte.de/recipes/bibim-noodle-sauce',
    steps,
  });
  assert.equal(de.recipeInstructions[0].name, undefined);
  assert.ok(
    de.recipeInstructions.every((step) =>
      step.url.startsWith('https://www.leckere-koreanische-rezepte.de/')
    )
  );
});

test('legacy instructions link to their visible section, and CMS text cannot break the JSON-LD script', () => {
  const details = recipeSearchDetails({
    ...base,
    instructions: 'Mix </script><p>the sauce</p>.',
  });
  assert.equal(
    details.recipeInstructions[0].url,
    `${base.canonicalUrl}#instructions`
  );
  const serialized = serializeRecipeSchema({ '@type': 'Recipe', ...details });
  assert.equal(serialized.includes('</script>'), false);
  assert.deepEqual(
    JSON.parse(serialized),
    JSON.parse(JSON.stringify({ '@type': 'Recipe', ...details }))
  );
  assert.equal(recipeSearchDetails({ ...base }).recipeInstructions, undefined);
});
