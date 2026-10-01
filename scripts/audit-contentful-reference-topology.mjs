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

const localeCodes = ['en', 'de'];
const limit = 1000;

async function fetchAll(contentType) {
  const items = [];
  let skip = 0;

  while (true) {
    const response = await client.getEntries({
      content_type: contentType,
      include: 0,
      limit,
      skip,
    });

    items.push(...response.items);

    if (items.length >= response.total || response.items.length === 0) {
      return items;
    }

    skip += response.items.length;
  }
}

function localeValue(field, locale) {
  if (field == null) return undefined;

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

function directIds(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => item?.sys?.id).filter(Boolean);
  }

  return value?.sys?.id ? [value.sys.id] : [];
}

function addUsage(map, childId, parentId) {
  if (!map.has(childId)) {
    map.set(childId, new Set());
  }

  map.get(childId).add(parentId);
}

function printUsageSummary(label, allEntries, usage) {
  const allIds = new Set(allEntries.map((entry) => entry.sys.id));

  const referenced = [...allIds].filter((id) => usage.has(id));
  const orphaned = [...allIds].filter((id) => !usage.has(id));
  const shared = [...usage.entries()]
    .filter(([, parents]) => parents.size > 1)
    .map(([id, parents]) => ({
      id,
      parents: [...parents],
    }));

  console.log(`\n=== ${label} ===`);
  console.log(`Total documents: ${allIds.size}`);
  console.log(`Referenced by recipes: ${referenced.length}`);
  console.log(`Not referenced by recipes: ${orphaned.length}`);
  console.log(`Shared by multiple recipes: ${shared.length}`);

  if (orphaned.length > 0) {
    console.log(`Orphan IDs: ${orphaned.join(', ')}`);
  }

  if (shared.length > 0) {
    console.log('Shared IDs:');
    for (const item of shared) {
      console.log(`  ${item.id} -> ${item.parents.join(', ')}`);
    }
  }
}

const [recipes, recipeIngredients, steps, ingredients, categories] =
  await Promise.all([
    fetchAll('recipe'),
    fetchAll('recipeIngredient'),
    fetchAll('step'),
    fetchAll('ingredient'),
    fetchAll('category'),
  ]);

const recipeIngredientUsage = new Map();
const stepUsage = new Map();
const categoryUsage = new Map();

let ingredientParityMismatches = 0;
let stepParityMismatches = 0;
let categoryParityMismatches = 0;

for (const recipe of recipes) {
  const recipeId = recipe.sys.id;

  const enIngredients = directIds(
    localeValue(recipe.fields.ingredients, 'en')
  );
  const deIngredients = directIds(
    localeValue(recipe.fields.ingredients, 'de')
  );

  const enSteps = directIds(localeValue(recipe.fields.steps, 'en'));
  const deSteps = directIds(localeValue(recipe.fields.steps, 'de'));

  const enCategories = directIds(
    localeValue(recipe.fields.categories, 'en')
  );
  const deCategories = directIds(
    localeValue(recipe.fields.categories, 'de')
  );

  if (JSON.stringify(enIngredients) !== JSON.stringify(deIngredients)) {
    ingredientParityMismatches += 1;
  }

  if (JSON.stringify(enSteps) !== JSON.stringify(deSteps)) {
    stepParityMismatches += 1;
  }

  if (JSON.stringify(enCategories) !== JSON.stringify(deCategories)) {
    categoryParityMismatches += 1;
  }

  for (const id of new Set([...enIngredients, ...deIngredients])) {
    addUsage(recipeIngredientUsage, id, recipeId);
  }

  for (const id of new Set([...enSteps, ...deSteps])) {
    addUsage(stepUsage, id, recipeId);
  }

  for (const id of new Set([...enCategories, ...deCategories])) {
    addUsage(categoryUsage, id, recipeId);
  }
}

const ingredientUsage = new Map();
let linkedIngredientLocaleMismatches = 0;
let missingLinkedIngredient = 0;

for (const recipeIngredient of recipeIngredients) {
  const id = recipeIngredient.sys.id;

  const enId = directIds(
    localeValue(recipeIngredient.fields.ingredient, 'en')
  )[0];

  const deId = directIds(
    localeValue(recipeIngredient.fields.ingredient, 'de')
  )[0];

  if (!enId || !deId) {
    missingLinkedIngredient += 1;
  }

  if (enId && deId && enId !== deId) {
    linkedIngredientLocaleMismatches += 1;
  }

  for (const ingredientId of new Set([enId, deId].filter(Boolean))) {
    addUsage(ingredientUsage, ingredientId, id);
  }
}

console.log('=== CONTENTFUL REFERENCE TOPOLOGY ===');
console.log(`Recipes: ${recipes.length}`);

console.log('\n=== EN / DE RECIPE REFERENCE PARITY ===');
console.log(
  `Recipes with ingredient ID/order mismatch: ${ingredientParityMismatches}`
);
console.log(`Recipes with step ID/order mismatch: ${stepParityMismatches}`);
console.log(
  `Recipes with category reference mismatch: ${categoryParityMismatches}`
);

printUsageSummary(
  'RECIPE INGREDIENT USAGE',
  recipeIngredients,
  recipeIngredientUsage
);

printUsageSummary('STEP USAGE', steps, stepUsage);

console.log('\n=== RECIPE INGREDIENT → INGREDIENT ===');
console.log(`Ingredient documents: ${ingredients.length}`);
console.log(`Ingredients referenced by RecipeIngredient: ${ingredientUsage.size}`);
console.log(
  `RecipeIngredients missing EN or DE ingredient reference: ${missingLinkedIngredient}`
);
console.log(
  `RecipeIngredients whose EN/DE ingredient IDs differ: ${linkedIngredientLocaleMismatches}`
);

const unusedIngredientIds = ingredients
  .map((entry) => entry.sys.id)
  .filter((id) => !ingredientUsage.has(id));

console.log(
  `Ingredients not referenced by any RecipeIngredient: ${unusedIngredientIds.length}`
);

if (unusedIngredientIds.length > 0) {
  console.log(`Unreferenced Ingredient IDs: ${unusedIngredientIds.join(', ')}`);
}

console.log('\n=== CATEGORY USAGE ===');
console.log(`Category documents: ${categories.length}`);
console.log(`Categories referenced by recipes: ${categoryUsage.size}`);
