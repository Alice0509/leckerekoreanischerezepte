import { createRequire } from 'node:module';
import { createClient } from 'contentful';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!space || !accessToken) {
  throw new Error(
    'CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN are required.'
  );
}

const client = createClient({
  space,
  accessToken,
}).withAllLocales;

async function fetchAll(contentType) {
  const items = [];
  let skip = 0;

  while (true) {
    const response = await client.getEntries({
      content_type: contentType,
      include: 0,
      limit: 1000,
      skip,
    });

    items.push(...response.items);

    if (items.length >= response.total || response.items.length === 0) {
      return items;
    }

    skip += response.items.length;
  }
}

function localized(field, locale) {
  if (!field) return undefined;

  if (
    typeof field === 'object' &&
    !Array.isArray(field) &&
    !field.sys &&
    Object.prototype.hasOwnProperty.call(field, locale)
  ) {
    return field[locale];
  }

  return field;
}

function unwrapLocalized(value) {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !value.sys
  ) {
    for (const locale of ['en', 'de']) {
      if (Object.prototype.hasOwnProperty.call(value, locale)) {
        return value[locale];
      }
    }
  }

  return value;
}

function ids(value) {
  const unwrapped = unwrapLocalized(value);

  if (!unwrapped) return [];

  if (Array.isArray(unwrapped)) {
    return unwrapped.map((item) => item?.sys?.id).filter(Boolean);
  }

  return unwrapped?.sys?.id ? [unwrapped.sys.id] : [];
}

const [recipes, steps] = await Promise.all([
  fetchAll('recipe'),
  fetchAll('step'),
]);

const stepById = new Map(steps.map((step) => [step.sys.id, step]));

let checkedStepIngredientRefs = 0;
let ownershipViolations = 0;
let missingSteps = 0;

for (const recipe of recipes) {
  const recipeId = recipe.sys.id;

  const recipeIngredientIds = new Set([
    ...ids(localized(recipe.fields.ingredients, 'en')),
    ...ids(localized(recipe.fields.ingredients, 'de')),
  ]);

  const recipeStepIds = new Set([
    ...ids(localized(recipe.fields.steps, 'en')),
    ...ids(localized(recipe.fields.steps, 'de')),
  ]);

  for (const stepId of recipeStepIds) {
    const step = stepById.get(stepId);

    if (!step) {
      missingSteps += 1;
      console.log(`Missing Step: ${stepId} in Recipe ${recipeId}`);
      continue;
    }

    for (const recipeIngredientId of ids(step.fields.ingredientsUsed)) {
      checkedStepIngredientRefs += 1;

      if (!recipeIngredientIds.has(recipeIngredientId)) {
        ownershipViolations += 1;

        console.log('');
        console.log('OWNERSHIP VIOLATION');
        console.log(`Recipe: ${recipeId}`);
        console.log(`Step: ${stepId}`);
        console.log(`RecipeIngredient: ${recipeIngredientId}`);
      }
    }
  }
}

console.log('=== STEP INGREDIENT OWNERSHIP ===');
console.log(`Recipes checked: ${recipes.length}`);
console.log(`Steps available: ${steps.length}`);
console.log(`ingredientsUsed references checked: ${checkedStepIngredientRefs}`);
console.log(`Missing recipe Steps: ${missingSteps}`);
console.log(`Ownership violations: ${ownershipViolations}`);
