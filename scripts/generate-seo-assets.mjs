import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import nextEnv from '@next/env';
import { createClient } from 'contentful';
import { INDEXABLE_INGREDIENT_SLUGS } from '../lib/ingredientDetailRoutes.js';
import {
  RECIPE_CATEGORY_ORDER,
  getRecipeCategorySlug,
} from '../lib/recipeCategories.js';

const require = createRequire(import.meta.url);

const { loadEnvConfig } = nextEnv;
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
const GENERATED_ROUTES_PATH = path.join(
  ROOT,
  'lib',
  'generated-localized-routes.json'
);

const PUBLIC_DIR = path.join(ROOT, 'public');

const SITE_ORIGINS = {
  de: 'https://www.leckere-koreanische-rezepte.de',
  en: 'https://www.hansikyoung.com',
};

const STATIC_SITEMAP_PATHS = ['/', '/about-us', '/gallery', '/ingredients'];

const client = createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
});

const localizedClient = client.withAllLocales;

const normalizeSlug = (value) => {
  if (typeof value !== 'string') return '';

  return value.trim().replace(/^\/+/, '').replace(/\/+$/, '');
};

const getLocalizedValue = (localizedField, language) => {
  if (!localizedField) return '';

  if (typeof localizedField === 'string') {
    return normalizeSlug(localizedField);
  }

  if (typeof localizedField !== 'object') {
    return '';
  }

  const matchingLocale = Object.keys(localizedField).find((locale) => {
    const normalizedLocale = locale.toLowerCase();

    return (
      normalizedLocale === language ||
      normalizedLocale.startsWith(`${language}-`)
    );
  });

  return matchingLocale ? normalizeSlug(localizedField[matchingLocale]) : '';
};

const fetchRecipePage = async ({ skip, limit }) => {
  const baseQuery = {
    content_type: 'recipe',
    skip,
    limit,
    include: 0,
  };

  try {
    return await localizedClient.getEntries({
      ...baseQuery,
      select: ['sys.id', 'sys.updatedAt', 'fields.slug'],
    });
  } catch (error) {
    console.warn(
      'Contentful select 쿼리를 사용할 수 없어 전체 필드 조회로 다시 시도합니다.'
    );

    return localizedClient.getEntries(baseQuery);
  }
};

const getSnapshotRecipesWithAllLocales = () => {
  const deDataset = getRecipeDatasetFromSnapshot('de');
  const enDataset = getRecipeDatasetFromSnapshot('en');

  if (!deDataset?.items || !enDataset?.items) {
    return null;
  }

  const recipesById = new Map();

  const addLocaleEntries = (locale, entries) => {
    for (const entry of entries) {
      const id = entry?.sys?.id;

      if (!id) {
        continue;
      }

      const current = recipesById.get(id) || {
        sys: {
          id,
          updatedAt: entry.sys?.updatedAt || '',
        },
        fields: {
          slug: {},
        },
      };

      const currentUpdatedAt = new Date(current.sys.updatedAt || 0).getTime();
      const entryUpdatedAt = new Date(entry.sys?.updatedAt || 0).getTime();

      if (entryUpdatedAt > currentUpdatedAt) {
        current.sys.updatedAt = entry.sys.updatedAt;
      }

      current.fields.slug[locale] = entry.fields?.slug || '';
      recipesById.set(id, current);
    }
  };

  addLocaleEntries('de', deDataset.items);
  addLocaleEntries('en', enDataset.items);

  return [...recipesById.values()];
};

const fetchAllRecipes = async () => {
  const snapshotRecipes = getSnapshotRecipesWithAllLocales();

  if (snapshotRecipes) {
    console.log(
      `[seo assets] build snapshot: ${snapshotRecipes.length} recipes`
    );

    return snapshotRecipes;
  }

  console.log('[seo assets] Contentful fallback');

  const limit = 1000;
  let skip = 0;
  const items = [];

  while (true) {
    const response = await fetchRecipePage({ skip, limit });

    items.push(...response.items);

    if (response.items.length === 0 || items.length >= response.total) {
      break;
    }

    skip += response.items.length;
  }

  return items;
};

const toIsoDate = (value) => {
  if (!value) return '';

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const xmlEscape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const joinUrl = (origin, pathname) =>
  pathname === '/' ? origin : `${origin}${pathname}`;

const createSitemapXml = ({ language, routeData }) => {
  const staticRecords = STATIC_SITEMAP_PATHS.map((pathname) => ({
    dePath: pathname,
    enPath: pathname,
    lastmod: '',
  }));

  const recipeRecords = Object.values(routeData.recipesById)
    .filter((recipe) => recipe.de && recipe.en)
    .map((recipe) => ({
      dePath: `/recipes/${recipe.de}`,
      enPath: `/recipes/${recipe.en}`,
      lastmod: recipe.updatedAt || '',
    }));

  const ingredientRecords = INDEXABLE_INGREDIENT_SLUGS.map((slug) => ({
    dePath: `/ingredients/${slug}`,
    enPath: `/ingredients/${slug}`,
    lastmod: '',
  }));

  const categoryRecords = RECIPE_CATEGORY_ORDER.map((key) => {
    const slug = getRecipeCategorySlug(key);

    return {
      dePath: `/categories/${slug}`,
      enPath: `/categories/${slug}`,
      lastmod: '',
    };
  });

  const records = [
    ...staticRecords,
    ...recipeRecords,
    ...ingredientRecords,
    ...categoryRecords,
  ].sort((a, b) => a.enPath.localeCompare(b.enPath));

  const urls = records
    .map((record) => {
      const currentPath = language === 'de' ? record.dePath : record.enPath;

      const currentUrl = joinUrl(SITE_ORIGINS[language], currentPath);

      const deUrl = joinUrl(SITE_ORIGINS.de, record.dePath);
      const enUrl = joinUrl(SITE_ORIGINS.en, record.enPath);

      const lastmod = record.lastmod
        ? `<lastmod>${xmlEscape(record.lastmod)}</lastmod>`
        : '';

      return [
        '<url>',
        `<loc>${xmlEscape(currentUrl)}</loc>`,
        lastmod,
        `<xhtml:link rel="alternate" hreflang="de" href="${xmlEscape(
          deUrl
        )}"/>`,
        `<xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(
          enUrl
        )}"/>`,
        `<xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(
          enUrl
        )}"/>`,
        '</url>',
      ]
        .filter(Boolean)
        .join('');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
};

const createRobotsTxt = (language) =>
  [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_ORIGINS[language]}/sitemap.xml`,
    '',
  ].join('\n');

const recipes = await fetchAllRecipes();

const routeData = {
  recipesById: {},
  recipeIdBySlug: {
    de: {},
    en: {},
  },
};

const missingLocales = [];

for (const entry of recipes) {
  const id = entry.sys.id;
  const localizedSlug = entry.fields?.slug;

  const deSlug = getLocalizedValue(localizedSlug, 'de');
  const enSlug = getLocalizedValue(localizedSlug, 'en');

  if (!deSlug || !enSlug) {
    missingLocales.push({
      id,
      de: deSlug || null,
      en: enSlug || null,
    });

    continue;
  }

  if (routeData.recipeIdBySlug.de[deSlug]) {
    throw new Error(`중복 독일어 recipe slug: ${deSlug}`);
  }

  if (routeData.recipeIdBySlug.en[enSlug]) {
    throw new Error(`중복 영어 recipe slug: ${enSlug}`);
  }

  routeData.recipesById[id] = {
    de: deSlug,
    en: enSlug,
    updatedAt: toIsoDate(entry.sys.updatedAt),
  };

  routeData.recipeIdBySlug.de[deSlug] = id;
  routeData.recipeIdBySlug.en[enSlug] = id;
}

routeData.recipesById = Object.fromEntries(
  Object.entries(routeData.recipesById).sort(([a], [b]) => a.localeCompare(b))
);

routeData.recipeIdBySlug.de = Object.fromEntries(
  Object.entries(routeData.recipeIdBySlug.de).sort(([a], [b]) =>
    a.localeCompare(b)
  )
);

routeData.recipeIdBySlug.en = Object.fromEntries(
  Object.entries(routeData.recipeIdBySlug.en).sort(([a], [b]) =>
    a.localeCompare(b)
  )
);

await fs.writeFile(
  GENERATED_ROUTES_PATH,
  `${JSON.stringify(routeData, null, 2)}\n`,
  'utf8'
);

await fs.writeFile(
  path.join(PUBLIC_DIR, 'sitemap-de.xml'),
  createSitemapXml({ language: 'de', routeData }),
  'utf8'
);

await fs.writeFile(
  path.join(PUBLIC_DIR, 'sitemap-en.xml'),
  createSitemapXml({ language: 'en', routeData }),
  'utf8'
);

await fs.writeFile(
  path.join(PUBLIC_DIR, 'robots-de.txt'),
  createRobotsTxt('de'),
  'utf8'
);

await fs.writeFile(
  path.join(PUBLIC_DIR, 'robots-en.txt'),
  createRobotsTxt('en'),
  'utf8'
);

console.log(
  `Localized recipe routes generated: ${
    Object.keys(routeData.recipesById).length
  }`
);

if (missingLocales.length > 0) {
  console.warn(
    'DE 또는 EN slug가 없어 sitemap에서 제외된 entries:',
    JSON.stringify(missingLocales, null, 2)
  );
}
