const test = require('node:test');
const assert = require('node:assert/strict');
const {
  orderedRecipeSteps,
  recipeSearchDetails,
  recipeIdentity,
  AUTHOR_ID,
  serializeRecipeSchema,
} = require('../lib/recipeSearchDetails.cjs');
const { firstPublicationDate } = require('../lib/recipeFreshness.cjs');

const toPlainText = (value) => (typeof value === 'string' ? value.trim() : '');
const base = {
  canonicalUrl: 'https://www.hansikyoung.com/recipes/bibim-noodle-sauce',
  locale: 'en',
  toPlainText,
};

test('both languages identify the same public author and link to their own category and author page', () => {
  for (const [locale, origin, slug] of [
    ['en', 'https://www.hansikyoung.com', 'easy-japanese-golden-curry'],
    [
      'de',
      'https://www.leckere-koreanische-rezepte.de',
      'einfaches-japanisches-golden-curry',
    ],
  ]) {
    const canonicalUrl = `${origin}/recipes/${slug}`;
    const identity = recipeIdentity({
      canonicalUrl,
      locale,
      title: 'Golden Curry',
      categorySlug: 'main-dishes',
      category: locale === 'de' ? 'Hauptgerichte' : 'Main dishes',
    });
    assert.deepEqual(identity.author, {
      '@type': 'Person',
      '@id': AUTHOR_ID,
      name: 'Joan',
      url: `${origin}/about-us`,
    });
    assert.equal(
      identity.breadcrumbs[0].name,
      locale === 'de' ? 'Startseite' : 'Home'
    );
    assert.equal(identity.breadcrumbs[1].href, '/categories/main-dishes');
    assert.equal(
      identity.breadcrumbs[1].url,
      `${origin}/categories/main-dishes`
    );
    assert.equal(identity.breadcrumbs[2].url, canonicalUrl);
    assert.equal(identity.breadcrumbs[2].href, undefined);
    assert.deepEqual(
      identity.breadcrumbSchema.itemListElement.map((item) => item.position),
      [1, 2, 3]
    );
    assert.deepEqual(
      identity.breadcrumbSchema.itemListElement.map((item) => [
        item.name,
        item.item,
      ]),
      identity.breadcrumbs.map((item) => [item.name, item.url])
    );
  }
});

test('missing or unsafe category paths do not create an invented breadcrumb destination', () => {
  for (const categorySlug of [
    undefined,
    '',
    '../recipes',
    'sauces?redirect=bad',
    'https://example.com',
  ]) {
    const identity = recipeIdentity({
      ...base,
      title: 'Bibim sauce',
      categorySlug,
      category: 'Sauces',
    });
    assert.equal(identity.breadcrumbs.length, 2);
    assert.equal(identity.breadcrumbs.at(-1).url, base.canonicalUrl);
    assert.deepEqual(
      identity.breadcrumbSchema.itemListElement.map((item) => item.position),
      [1, 2]
    );
  }
});

test('breadcrumb recipe text is serialized safely and author identity does not expose credentials', () => {
  const identity = recipeIdentity({
    ...base,
    title: '</script><p>Soup & rice</p>',
    categorySlug: 'soups-stews',
    category: 'Soups & stews',
  });
  const serialized = serializeRecipeSchema(identity.breadcrumbSchema);
  assert.ok(!serialized.includes('</script>'));
  assert.equal(
    JSON.parse(serialized).itemListElement.at(-1).name,
    '</script><p>Soup & rice</p>'
  );
  for (const canonicalUrl of [
    'http://www.hansikyoung.com/recipes/soup',
    'https://name:password@www.hansikyoung.com/recipes/soup',
  ]) {
    assert.throws(() =>
      recipeIdentity({ ...base, canonicalUrl, title: 'Soup' })
    );
  }
});

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
