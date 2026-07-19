import fs from 'node:fs';
import dotenv from 'dotenv';
import { createClient } from 'contentful';

dotenv.config({ path: '.env.local' });

const requiredEnvironmentVariables = [
  'CONTENTFUL_SPACE_ID',
  'CONTENTFUL_ACCESS_TOKEN',
];

for (const variableName of requiredEnvironmentVariables) {
  if (!process.env[variableName]) {
    console.error(`Missing environment variable: ${variableName}`);
    process.exit(1);
  }
}

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

const LOCALES = ['de', 'en'];

const PRIORITY_INGREDIENT_SLUG_KEYWORDS = [
  'gochujang',
  'gochugaru',
  'kimchi',
  'reis',
  'rice',
  'tofu',
  'sesam',
  'sesame',
  'doenjang',
  'sojasauce',
  'soy',
  'nori',
  'gim',
  'dangmyeon',
  'tteok',
];

const asArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const getLocalizedScalar = (field, locale) => {
  if (typeof field === 'string') return field;
  return field?.[locale] || '';
};

const getLocalizedValues = (field, locale) => {
  if (!field) return [];

  if (Array.isArray(field) || field.sys) {
    return asArray(field);
  }

  if (field[locale] !== undefined) {
    return asArray(field[locale]);
  }

  return Object.values(field).flatMap(asArray);
};

const suggestSlug = (value) =>
  String(value || '')
    .trim()
    .replace(/([a-z0-9])([A-ZÄÖÜ])/g, '$1-$2')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isPrioritySlug = (slug) => {
  const normalized = String(slug || '').toLowerCase();

  return PRIORITY_INGREDIENT_SLUG_KEYWORDS.some((keyword) =>
    normalized.includes(keyword)
  );
};

const getInitialIssues = ({ raw, locale }) => {
  if (!raw) return ['missing'];

  const issues = [];

  if (raw !== raw.trim()) {
    issues.push('leadingOrTrailingSpace');
  }

  if (/[A-Z]/.test(raw)) {
    issues.push('uppercase');
  }

  if (/[a-z0-9][A-Z]/.test(raw)) {
    issues.push('camelCase');
  }

  if (/\s/.test(raw)) {
    issues.push('whitespace');
  }

  if (/[^\x00-\x7F]/.test(raw)) {
    issues.push('nonAscii');
  }

  if (!/^[a-z0-9-]+$/.test(raw)) {
    issues.push('unsafeCharacters');
  }

  if (
    locale === 'en' &&
    /\b(oder|und|pilze|reis|bohnen|hähnchen|huehnchen)\b/i.test(raw)
  ) {
    issues.push('possibleWrongLanguage');
  }

  return issues;
};

const getSeverity = (row) => {
  const issues = new Set(row.issues);

  if (
    issues.has('missing') ||
    issues.has('leadingOrTrailingSpace') ||
    issues.has('suggestedCollision')
  ) {
    return 'critical';
  }

  if (
    issues.has('possibleWrongLanguage') ||
    issues.has('whitespace') ||
    issues.has('nonAscii') ||
    row.priority
  ) {
    return 'high';
  }

  return 'medium';
};

const severityOrder = {
  critical: 0,
  high: 1,
  medium: 2,
};

const ingredientResponse = await client.withAllLocales.getEntries({
  content_type: 'ingredient',
  limit: 1000,
});

const recipeResponse = await client.withAllLocales.getEntries({
  content_type: 'recipe',
  include: 2,
  limit: 1000,
});

const allIncludedEntries = [
  ...recipeResponse.items,
  ...(recipeResponse.includes?.Entry || []),
];

const entryById = new Map(
  allIncludedEntries.map((entry) => [entry.sys.id, entry])
);

const recipeUsageByIngredientAndLocale = new Map();
const totalRecipeUsageByIngredient = new Map();

for (const recipe of recipeResponse.items) {
  for (const locale of LOCALES) {
    const recipeIngredientReferences = getLocalizedValues(
      recipe.fields.ingredients,
      locale
    );

    const ingredientIdsInRecipe = new Set();

    for (const recipeIngredientReference of recipeIngredientReferences) {
      const recipeIngredient = recipeIngredientReference?.fields
        ? recipeIngredientReference
        : entryById.get(recipeIngredientReference?.sys?.id);

      if (!recipeIngredient) continue;

      const ingredientReferences = getLocalizedValues(
        recipeIngredient.fields?.ingredient,
        locale
      );

      for (const ingredientReference of ingredientReferences) {
        if (ingredientReference?.sys?.id) {
          ingredientIdsInRecipe.add(ingredientReference.sys.id);
        }
      }
    }

    for (const ingredientId of ingredientIdsInRecipe) {
      const localeKey = `${ingredientId}:${locale}`;

      if (!recipeUsageByIngredientAndLocale.has(localeKey)) {
        recipeUsageByIngredientAndLocale.set(localeKey, new Set());
      }

      recipeUsageByIngredientAndLocale.get(localeKey).add(recipe.sys.id);

      if (!totalRecipeUsageByIngredient.has(ingredientId)) {
        totalRecipeUsageByIngredient.set(ingredientId, new Set());
      }

      totalRecipeUsageByIngredient.get(ingredientId).add(recipe.sys.id);
    }
  }
}

const rows = [];

for (const ingredient of ingredientResponse.items) {
  for (const locale of LOCALES) {
    const raw = getLocalizedScalar(ingredient.fields.slug, locale);

    const name = getLocalizedScalar(ingredient.fields.name, locale);

    const suggested = suggestSlug(raw);
    const issues = getInitialIssues({ raw, locale });

    rows.push({
      id: ingredient.sys.id,
      locale,
      name,
      raw,
      suggested,
      priority: isPrioritySlug(raw) || isPrioritySlug(suggested),
      recipes:
        recipeUsageByIngredientAndLocale.get(`${ingredient.sys.id}:${locale}`)
          ?.size || 0,
      totalRecipes:
        totalRecipeUsageByIngredient.get(ingredient.sys.id)?.size || 0,
      issues,
    });
  }
}

const suggestedGroups = new Map();

for (const row of rows) {
  if (!row.suggested) continue;

  const key = `${row.locale}:${row.suggested}`;

  if (!suggestedGroups.has(key)) {
    suggestedGroups.set(key, []);
  }

  suggestedGroups.get(key).push(row);
}

const collisionGroups = [];

for (const [key, group] of suggestedGroups) {
  const uniqueEntryIds = new Set(group.map((row) => row.id));

  if (uniqueEntryIds.size < 2) continue;

  collisionGroups.push({
    key,
    locale: group[0].locale,
    suggested: group[0].suggested,
    entries: group.map((row) => ({
      id: row.id,
      name: row.name,
      raw: row.raw,
      recipes: row.recipes,
    })),
  });

  for (const row of group) {
    if (!row.issues.includes('suggestedCollision')) {
      row.issues.push('suggestedCollision');
    }
  }
}

for (const row of rows) {
  row.severity = getSeverity(row);
}

const findings = rows
  .filter((row) => row.issues.length > 0)
  .sort(
    (a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity] ||
      Number(b.priority) - Number(a.priority) ||
      b.totalRecipes - a.totalRecipes ||
      a.locale.localeCompare(b.locale) ||
      a.raw.localeCompare(b.raw)
  );

const uniqueFindingEntries = new Set(findings.map((row) => row.id));

const priorityFindingEntries = new Set(
  findings.filter((row) => row.priority).map((row) => row.id)
);

const usedFindingEntries = new Set(
  findings.filter((row) => row.totalRecipes > 0).map((row) => row.id)
);

const issueCounts = {};

for (const row of findings) {
  for (const issue of row.issues) {
    issueCounts[issue] = (issueCounts[issue] || 0) + 1;
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  ingredientsAudited: ingredientResponse.items.length,
  localizedSlugValues: rows.length,
  findingValues: findings.length,
  uniqueFindingEntries: uniqueFindingEntries.size,
  priorityFindingEntries: priorityFindingEntries.size,
  usedFindingEntries: usedFindingEntries.size,
  collisionGroups,
  issueCounts,
  findings,
};

fs.writeFileSync(
  '/tmp/hansik-ingredient-slug-decision-report.json',
  JSON.stringify(report, null, 2)
);

console.log('\n===== INGREDIENT SLUG SUMMARY =====');
console.log(`Ingredients audited: ${report.ingredientsAudited}`);
console.log(`Localized slug values: ${report.localizedSlugValues}`);
console.log(`Finding values: ${report.findingValues}`);
console.log(
  `Unique ingredient entries with findings: ${report.uniqueFindingEntries}`
);
console.log(`Priority entries with findings: ${report.priorityFindingEntries}`);
console.log(`Used entries with findings: ${report.usedFindingEntries}`);
console.log(
  `Suggested-slug collision groups: ${report.collisionGroups.length}`
);

console.log('\n===== ISSUE COUNTS =====');
console.table(
  Object.entries(issueCounts).map(([issue, count]) => ({
    issue,
    count,
  }))
);

console.log('\n===== COLLISIONS =====');

if (collisionGroups.length === 0) {
  console.log('No suggested-slug collisions.');
} else {
  for (const collision of collisionGroups) {
    console.log(`\n${collision.locale}: ${collision.suggested}`);

    console.table(collision.entries);
  }
}

console.log('\n===== DECISION LIST =====');

console.table(
  findings.map((row) => ({
    severity: row.severity,
    id: row.id,
    locale: row.locale,
    name: row.name,
    current: row.raw,
    suggested: row.suggested,
    recipes: row.recipes,
    priority: row.priority,
    issues: row.issues.join(', '),
  }))
);

console.log('\nReport: /tmp/hansik-ingredient-slug-decision-report.json');
