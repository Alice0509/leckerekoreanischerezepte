import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { getRecipeCategoryFromFields } from '../lib/recipeCategories.js';

const require = createRequire(import.meta.url);

const {
  getRecipeDatasetFromSnapshot,
} = require('../lib/contentfulBuildSnapshot.cjs');

const ITEMS_PER_PAGE = 20;

const getCardImageUrl = (imageField, assetsMap) => {
  if (!imageField) return '/images/default.png';

  const image = Array.isArray(imageField) ? imageField[0] : imageField;

  const directUrl = image?.fields?.file?.url;

  if (directUrl) {
    return directUrl.startsWith('//') ? `https:${directUrl}` : directUrl;
  }

  const assetUrl = image?.sys?.id
    ? assetsMap.get(image.sys.id)?.fields?.file?.url
    : null;

  if (assetUrl) {
    return assetUrl.startsWith('//') ? `https:${assetUrl}` : assetUrl;
  }

  return '/images/default.png';
};

const mapRecipeForCard = (item, locale, assetsMap) => {
  const categoryData = getRecipeCategoryFromFields(item.fields, locale);

  return {
    id: item.sys.id,
    slug: item.fields.slug || null,
    titel: item.fields.titel || '',
    title: item.fields.titel || '',
    category: categoryData.label,
    categoryKey: categoryData.key,
    youTubeUrl: item.fields.youTubeUrl || null,
    image: getCardImageUrl(item.fields.image, assetsMap),
  };
};

const generateLocale = async (locale) => {
  const dataset = getRecipeDatasetFromSnapshot(locale);

  if (!dataset?.items) {
    throw new Error(
      `[recipe page data] Missing ${locale.toUpperCase()} recipe snapshot.`
    );
  }

  const assetsMap = new Map(
    (dataset.includes?.Asset || []).map((asset) => [asset.sys.id, asset])
  );

  const sortedEntries = [...dataset.items].sort((a, b) => {
    const aCreated = Date.parse(a?.sys?.createdAt || 0);
    const bCreated = Date.parse(b?.sys?.createdAt || 0);

    return bCreated - aCreated;
  });

  const recipes = sortedEntries.map((item) =>
    mapRecipeForCard(item, locale, assetsMap)
  );

  const totalPages = Math.max(Math.ceil(recipes.length / ITEMS_PER_PAGE), 1);

  const outputDir = path.join(
    process.cwd(),
    'public',
    'data',
    'recipes',
    locale
  );

  await fs.rm(outputDir, {
    recursive: true,
    force: true,
  });

  await fs.mkdir(outputDir, {
    recursive: true,
  });

  for (let page = 1; page <= totalPages; page += 1) {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const pageRecipes = recipes.slice(start, start + ITEMS_PER_PAGE);

    const payload = {
      locale,
      currentPage: page,
      totalPages,
      totalRecipes: recipes.length,
      recipes: pageRecipes,
    };

    await fs.writeFile(
      path.join(outputDir, `page-${page}.json`),
      `${JSON.stringify(payload)}\n`,
      'utf8'
    );
  }

  await fs.writeFile(
    path.join(outputDir, 'manifest.json'),
    `${JSON.stringify({
      locale,
      itemsPerPage: ITEMS_PER_PAGE,
      totalPages,
      totalRecipes: recipes.length,
    })}\n`,
    'utf8'
  );

  console.log(
    `[recipe page data] ${locale.toUpperCase()}: ` +
      `${recipes.length} recipes, ${totalPages} pages`
  );
};

await generateLocale('de');
await generateLocale('en');

console.log('[recipe page data] Static pagination data generated.');
