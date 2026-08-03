import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createClient } from 'contentful';

const require = createRequire(import.meta.url);

const { fetchAllEntriesResponse } = require('../lib/contentfulPagination.cjs');

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
});

const snapshotPath = path.join(
  process.cwd(),
  '.next',
  'cache',
  'contentful-build-snapshot.json'
);

const fetchLocaleSnapshot = async (locale) => {
  const [recipes, ingredients, favorites] = await Promise.all([
    fetchAllEntriesResponse(client, {
      content_type: 'recipe',
      locale,
      include: 3,
    }),
    fetchAllEntriesResponse(client, {
      content_type: 'ingredient',
      locale,
      include: 1,
    }),
    fetchAllEntriesResponse(client, {
      content_type: 'favoriteItem',
      locale,
      include: 2,
    }),
  ]);

  return {
    recipes,
    ingredients,
    favorites,
  };
};

console.log('[contentful snapshot] Fetching DE and EN content...');

const [de, en] = await Promise.all([
  fetchLocaleSnapshot('de'),
  fetchLocaleSnapshot('en'),
]);

const snapshot = {
  version: 1,
  generatedAt: new Date().toISOString(),
  locales: {
    de,
    en,
  },
};

await fs.mkdir(path.dirname(snapshotPath), {
  recursive: true,
});

await fs.writeFile(snapshotPath, `${JSON.stringify(snapshot)}\n`, 'utf8');

const printLocaleSummary = (locale, data) => {
  console.log(
    `[contentful snapshot] ${locale.toUpperCase()}: ` +
      `${data.recipes.items.length} recipes, ` +
      `${data.ingredients.items.length} ingredients, ` +
      `${data.favorites.items.length} favorites`
  );
};

printLocaleSummary('de', de);
printLocaleSummary('en', en);

const stat = await fs.stat(snapshotPath);

console.log(
  `[contentful snapshot] Written to ${snapshotPath} ` +
    `(${Math.round(stat.size / 1024)} KB)`
);
