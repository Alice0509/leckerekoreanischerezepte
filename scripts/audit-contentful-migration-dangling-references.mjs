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

function ids(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => item?.sys?.id).filter(Boolean);
  }

  return value?.sys?.id ? [value.sys.id] : [];
}

const [recipes, recipeIngredients, ingredients, steps] = await Promise.all([
  fetchAll('recipe'),
  fetchAll('recipeIngredient'),
  fetchAll('ingredient'),
  fetchAll('step'),
]);

const publishedIngredientIds = new Set(
  ingredients.map((entry) => entry.sys.id)
);

const recipeIngredientIdsUsedByRecipes = new Set();

for (const recipe of recipes) {
  for (const locale of ['en', 'de']) {
    for (const id of ids(localized(recipe.fields.ingredients, locale))) {
      recipeIngredientIdsUsedByRecipes.add(id);
    }
  }
}

const recipeIngredientIdsUsedBySteps = new Set();

for (const step of steps) {
  for (const id of ids(step.fields.ingredientsUsed)) {
    recipeIngredientIdsUsedBySteps.add(id);
  }
}

console.log('=== DANGLING INGREDIENT REFERENCES ===');

let danglingCount = 0;

for (const ri of recipeIngredients) {
  const enIngredientId = ids(localized(ri.fields.ingredient, 'en'))[0];
  const deIngredientId = ids(localized(ri.fields.ingredient, 'de'))[0];

  for (const ingredientId of new Set(
    [enIngredientId, deIngredientId].filter(Boolean)
  )) {
    if (!publishedIngredientIds.has(ingredientId)) {
      danglingCount += 1;

      console.log('');
      console.log(`RecipeIngredient: ${ri.sys.id}`);
      console.log(`EN title: ${localized(ri.fields.title, 'en') || '-'}`);
      console.log(`DE title: ${localized(ri.fields.title, 'de') || '-'}`);
      console.log(`Missing Ingredient ID: ${ingredientId}`);
      console.log(
        `Used by recipe: ${recipeIngredientIdsUsedByRecipes.has(ri.sys.id)}`
      );
      console.log(
        `Used by step.ingredientsUsed: ${recipeIngredientIdsUsedBySteps.has(
          ri.sys.id
        )}`
      );
    }
  }
}

console.log('');
console.log(`Dangling Ingredient references: ${danglingCount}`);

console.log('\n=== ORPHAN RECIPE INGREDIENTS ===');

const orphanRecipeIngredients = recipeIngredients.filter(
  (ri) => !recipeIngredientIdsUsedByRecipes.has(ri.sys.id)
);

for (const ri of orphanRecipeIngredients) {
  console.log('');
  console.log(`ID: ${ri.sys.id}`);
  console.log(`EN: ${localized(ri.fields.title, 'en') || '-'}`);
  console.log(`DE: ${localized(ri.fields.title, 'de') || '-'}`);
  console.log(
    `Used by step.ingredientsUsed: ${recipeIngredientIdsUsedBySteps.has(
      ri.sys.id
    )}`
  );
}

console.log('');
console.log(`Orphan RecipeIngredients: ${orphanRecipeIngredients.length}`);
