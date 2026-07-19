import fs from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';
import { createClient } from 'contentful';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!SPACE_ID || !ACCESS_TOKEN) {
  throw new Error(
    'CONTENTFUL_SPACE_ID 또는 CONTENTFUL_ACCESS_TOKEN이 없습니다.'
  );
}

const client = createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
});

const allLocalesClient = client.withAllLocales;

const CANONICAL_CATEGORIES = {
  '7yj6rIPLvfnAKYEbtXJfGZ': {
    de: 'Beilagen',
    en: 'Side dishes',
  },
  '2HCHhhkHnB4b1PXkFNA6re': {
    de: 'Reis & Nudeln',
    en: 'Rice & noodles',
  },
  '3NWw88VFThg4qOh2cWcsv4': {
    de: 'Eintöpfe & Suppen',
    en: 'Stews & soups',
  },
  '3QTRNQE0N96BJUaUpxP3CV': {
    de: 'Saucen & Basics',
    en: 'Sauces & basics',
  },
  '6lZRRDly3xFKTgvVUi1bUP': {
    de: 'Hauptgerichte',
    en: 'Main dishes',
  },
  '7vzRvIoPuR1UhwlABtgjNq': {
    de: 'Süßes & Gebäck',
    en: 'Sweets & baking',
  },
  NqJXw3ssjQAEgpPxtBnXX: {
    de: 'Streetfood',
    en: 'Street food',
  },
};

const normalizeWhitespace = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

const richTextToPlainText = (value, seen = new WeakSet()) => {
  if (value == null) return '';

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => richTextToPlainText(item, seen))
      .filter(Boolean)
      .join(' ');
  }

  if (typeof value !== 'object') return '';

  if (seen.has(value)) return '';
  seen.add(value);

  if (typeof value.value === 'string') {
    return value.value;
  }

  if (value.content) {
    return richTextToPlainText(value.content, seen);
  }

  return '';
};

const getPlainText = (value) => normalizeWhitespace(richTextToPlainText(value));

const getLocalizedValue = (entry, field, locale) =>
  entry?.fields?.[field]?.[locale];

const getLocalizedText = (entry, field, locale) =>
  getPlainText(getLocalizedValue(entry, field, locale));

const getLinkedEntry = (value) => {
  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value || null;
};

const getEntryLabel = (entry, locale) => {
  const possibleFields = [
    'name',
    'title',
    'titel',
    'label',
    'categoryName',
    'kategorie',
    'slug',
  ];

  for (const field of possibleFields) {
    const value = getLocalizedText(entry, field, locale);

    if (value) return value;
  }

  for (const localizedValue of Object.values(entry?.fields || {})) {
    const value = getPlainText(
      localizedValue?.[locale] ?? localizedValue?.de ?? localizedValue?.en
    );

    if (value) return value;
  }

  return '';
};

const fetchAllRecipes = async () => {
  const recipes = [];
  const limit = 1000;
  let skip = 0;

  while (true) {
    const response = await allLocalesClient.getEntries({
      content_type: 'recipe',
      include: 4,
      limit,
      skip,
    });

    recipes.push(...response.items);

    if (response.items.length === 0 || recipes.length >= response.total) {
      break;
    }

    skip += response.items.length;
  }

  return recipes;
};

const recipes = await fetchAllRecipes();
const findings = [];
const categoryUsage = new Map();

for (const recipe of recipes) {
  const slug =
    getLocalizedText(recipe, 'slug', 'en') ||
    getLocalizedText(recipe, 'slug', 'de') ||
    recipe.sys.id;

  const title =
    getLocalizedText(recipe, 'titel', 'de') ||
    getLocalizedText(recipe, 'titel', 'en') ||
    '(missing)';

  const legacyDe = getLocalizedText(recipe, 'category', 'de');

  const legacyEn = getLocalizedText(recipe, 'category', 'en');

  const linkedDe = getLinkedEntry(
    getLocalizedValue(recipe, 'categories', 'de')
  );

  const linkedEn = getLinkedEntry(
    getLocalizedValue(recipe, 'categories', 'en')
  );

  const deId = linkedDe?.sys?.id || null;
  const enId = linkedEn?.sys?.id || null;

  const issues = [];

  if (!deId) {
    issues.push('German categories link missing');
  }

  if (!enId) {
    issues.push('English categories link missing');
  }

  if (deId && enId && deId !== enId) {
    issues.push(`DE/EN category link mismatch: de=${deId}, en=${enId}`);
  }

  const categoryId = deId || enId;

  if (categoryId && !CANONICAL_CATEGORIES[categoryId]) {
    issues.push(`Unknown category entry: ${categoryId}`);
  }

  const expected = categoryId ? CANONICAL_CATEGORIES[categoryId] : null;

  if (expected) {
    const linkedDeLabel = linkedDe ? getEntryLabel(linkedDe, 'de') : '';

    const linkedEnLabel = linkedEn ? getEntryLabel(linkedEn, 'en') : '';

    if (linkedDeLabel !== expected.de) {
      issues.push(
        `Category entry DE label: expected "${expected.de}", found "${linkedDeLabel || '(missing)'}"`
      );
    }

    if (linkedEnLabel !== expected.en) {
      issues.push(
        `Category entry EN label: expected "${expected.en}", found "${linkedEnLabel || '(missing)'}"`
      );
    }

    if (legacyDe !== expected.de) {
      issues.push(
        `Legacy category.de: expected "${expected.de}", found "${legacyDe || '(missing)'}"`
      );
    }

    if (legacyEn !== expected.en) {
      issues.push(
        `Legacy category.en: expected "${expected.en}", found "${legacyEn || '(missing)'}"`
      );
    }

    if (!categoryUsage.has(categoryId)) {
      categoryUsage.set(categoryId, {
        id: categoryId,
        ...expected,
        count: 0,
        recipes: [],
      });
    }

    const usage = categoryUsage.get(categoryId);
    usage.count += 1;
    usage.recipes.push(slug);
  }

  if (issues.length > 0) {
    findings.push({
      id: recipe.sys.id,
      slug,
      title,
      categoryId,
      legacyDe,
      legacyEn,
      issues,
    });
  }
}

findings.sort((a, b) => a.slug.localeCompare(b.slug));

const categoryList = Object.entries(CANONICAL_CATEGORIES).map(
  ([id, labels]) => {
    const usage = categoryUsage.get(id);

    return {
      id,
      ...labels,
      count: usage?.count || 0,
      recipes: usage?.recipes || [],
    };
  }
);

const unusedCategories = categoryList.filter(
  (category) => category.count === 0
);

const report = {
  generatedAt: new Date().toISOString(),
  totalRecipes: recipes.length,
  canonicalCategoryCount: categoryList.length,
  recipesWithCategoryIssues: findings.length,
  unusedCategories,
  categories: categoryList,
  findings,
};

const outputPath = path.join('/tmp', 'hansik-recipe-category-audit.json');

await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`Recipes audited: ${recipes.length}`);
console.log(`Canonical categories: ${categoryList.length}`);
console.log(`Recipes with category issues: ${findings.length}`);
console.log(`Unused categories: ${unusedCategories.length}`);
console.log(`Report: ${outputPath}`);
console.log('');

console.log('===== CATEGORY USAGE =====');

for (const category of categoryList) {
  console.log(`- ${category.de} | ${category.en}: ${category.count} recipes`);
}

console.log('');

for (const recipe of findings) {
  console.log(`===== ${recipe.slug} =====`);
  console.log(`Title: ${recipe.title}`);

  for (const issue of recipe.issues) {
    console.log(`- ${issue}`);
  }

  console.log('');
}

if (findings.length > 0 || unusedCategories.length > 0) {
  process.exitCode = 1;
}
