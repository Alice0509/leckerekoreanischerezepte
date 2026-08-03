import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import nextEnv from '@next/env';
import { createClient } from 'contentful';
import contentfulPagination from '../lib/contentfulPagination.cjs';
import { getCanonicalIngredientEntryId } from '../lib/ingredientSlugs.js';

const require = createRequire(import.meta.url);

const { loadEnvConfig } = nextEnv;
const { fetchAllEntriesResponse } = contentfulPagination;
const {
  getRecipeDatasetFromSnapshot,
} = require('../lib/contentfulBuildSnapshot.cjs');

loadEnvConfig(process.cwd());

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!SPACE_ID || !ACCESS_TOKEN) {
  throw new Error(
    'CONTENTFUL_SPACE_ID 또는 CONTENTFUL_ACCESS_TOKEN이 없습니다.'
  );
}

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(
  ROOT,
  'lib',
  'generated-ingredient-recipe-index.json'
);

const LOCALES = ['de', 'en'];
const DEFAULT_IMAGE = '/images/default.png';

const client = createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
});

const getContentTypeId = (entry) => entry?.sys?.contentType?.sys?.id || '';

const getAssetUrl = (imageField, assetById) => {
  const imageReference = Array.isArray(imageField) ? imageField[0] : imageField;

  const assetId = imageReference?.sys?.id;

  if (!assetId) {
    return DEFAULT_IMAGE;
  }

  const asset = imageReference?.fields?.file?.url
    ? imageReference
    : assetById.get(assetId);

  const assetUrl = asset?.fields?.file?.url;

  return assetUrl ? `https:${assetUrl}` : DEFAULT_IMAGE;
};

const createLocaleIndex = async (locale) => {
  const snapshotResponse = getRecipeDatasetFromSnapshot(locale);

  const response =
    snapshotResponse ||
    (await fetchAllEntriesResponse(client, {
      content_type: 'recipe',
      locale,
      include: 2,
    }));

  console.log(
    `[ingredient index] ${locale.toUpperCase()}: ${
      snapshotResponse ? 'build snapshot' : 'Contentful fallback'
    }`
  );

  const includedEntries = response.includes?.Entry || [];
  const includedAssets = response.includes?.Asset || [];

  const recipeIngredientById = new Map(
    includedEntries
      .filter((entry) => getContentTypeId(entry) === 'recipeIngredient')
      .map((entry) => [entry.sys.id, entry])
  );

  const assetById = new Map(
    includedAssets.map((asset) => [asset.sys.id, asset])
  );

  const recipesByIngredientId = new Map();

  for (const recipe of response.items) {
    const recipeIngredientReferences = Array.isArray(recipe.fields?.ingredients)
      ? recipe.fields.ingredients
      : [];

    const recipeRecord = {
      id: recipe.sys.id,
      slug: recipe.fields?.slug || '',
      titel: recipe.fields?.titel || '',
      image: getAssetUrl(recipe.fields?.image, assetById),
    };

    if (!recipeRecord.slug || !recipeRecord.titel) {
      continue;
    }

    const ingredientIds = new Set();

    for (const reference of recipeIngredientReferences) {
      const recipeIngredient = reference?.fields
        ? reference
        : recipeIngredientById.get(reference?.sys?.id);

      const ingredientId = recipeIngredient?.fields?.ingredient?.sys?.id;

      if (ingredientId) {
        ingredientIds.add(ingredientId);
      }
    }

    for (const ingredientId of ingredientIds) {
      const canonicalIngredientId = getCanonicalIngredientEntryId(ingredientId);

      if (!canonicalIngredientId) {
        continue;
      }

      if (!recipesByIngredientId.has(canonicalIngredientId)) {
        recipesByIngredientId.set(canonicalIngredientId, new Map());
      }

      recipesByIngredientId
        .get(canonicalIngredientId)
        .set(recipeRecord.id, recipeRecord);
    }
  }

  return new Map(
    [...recipesByIngredientId.entries()].map(([ingredientId, recipeMap]) => [
      ingredientId,
      [...recipeMap.values()],
    ])
  );
};

const localeIndexes = {};

for (const locale of LOCALES) {
  localeIndexes[locale] = await createLocaleIndex(locale);
}

const allIngredientIds = new Set();

for (const locale of LOCALES) {
  for (const ingredientId of localeIndexes[locale].keys()) {
    allIngredientIds.add(ingredientId);
  }
}

const ingredientRecipeIndex = {};

for (const ingredientId of [...allIngredientIds].sort((a, b) =>
  a.localeCompare(b)
)) {
  ingredientRecipeIndex[ingredientId] = {
    de: localeIndexes.de.get(ingredientId) || [],
    en: localeIndexes.en.get(ingredientId) || [],
  };
}

await fs.writeFile(
  OUTPUT_PATH,
  `${JSON.stringify(ingredientRecipeIndex, null, 2)}\n`,
  'utf8'
);

const recipeReferenceCounts = Object.values(ingredientRecipeIndex).reduce(
  (counts, localizedRecipes) => ({
    de: counts.de + localizedRecipes.de.length,
    en: counts.en + localizedRecipes.en.length,
  }),
  { de: 0, en: 0 }
);

console.log(
  `Ingredient recipe index generated: ${
    Object.keys(ingredientRecipeIndex).length
  } ingredients, ${recipeReferenceCounts.de} DE references, ${
    recipeReferenceCounts.en
  } EN references`
);
