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

  if (value.fields) {
    return richTextToPlainText(value.fields, seen);
  }

  return Object.entries(value)
    .filter(([key]) => key !== 'sys' && key !== 'metadata')
    .map(([, item]) => richTextToPlainText(item, seen))
    .filter(Boolean)
    .join(' ');
};

const getPlainText = (value) => normalizeWhitespace(richTextToPlainText(value));

const GERMAN_PATTERNS = [
  {
    label: 'German sentence',
    regex:
      /\b(falls du|wenn du|füge|gib .* hinzu|brate|schneide|rühre|verrühre|koche|köchle|abschmecken|servieren|hinzufügen|deinen wünschen|thunfisch|zwiebel|pfanne|topf)\b/i,
  },
  {
    label: 'German instruction wording',
    regex:
      /\b(das öl|mit wasser|bei mittlerer hitze|zum schluss|anschließend|danach|vorher|weiterbraten|abgießen)\b/i,
  },
];

const GERMANY_CONTEXT_PATTERNS = [
  {
    label: 'Germany-specific context',
    regex:
      /\b(in germany|here in germany|available in germany|german supermarkets?|german grocery stores?|german asian markets?)\b/i,
  },
];

const findMatches = (text, patterns) =>
  patterns.filter(({ regex }) => regex.test(text)).map(({ label }) => label);

const shorten = (text, length = 240) => {
  if (text.length <= length) return text;
  return `${text.slice(0, length - 3).trim()}...`;
};

const fetchAllRecipes = async () => {
  const limit = 1000;
  let skip = 0;
  const items = [];

  while (true) {
    const response = await client.getEntries({
      content_type: 'recipe',
      locale: 'en',
      include: 3,
      limit,
      skip,
    });

    items.push(...response.items);

    if (response.items.length === 0 || items.length >= response.total) {
      break;
    }

    skip += response.items.length;
  }

  return items;
};

const recipes = await fetchAllRecipes();
const findings = [];

for (const recipe of recipes) {
  const fields = recipe.fields || {};
  const slug = normalizeWhitespace(fields.slug);
  const title = getPlainText(fields.titel);

  const sections = [
    ['title', title],
    ['description', getPlainText(fields.description)],
    ['instructions', getPlainText(fields.instructions)],
    ['seoTitle', getPlainText(fields.seoTitle)],
    ['seoDescription', getPlainText(fields.seoDescription)],
  ];

  const steps = Array.isArray(fields.steps) ? fields.steps : [];

  steps.forEach((step, index) => {
    sections.push([
      `step ${step?.fields?.stepNumber || index + 1}`,
      getPlainText(step?.fields?.description),
    ]);
  });

  const recipeFindings = [];

  for (const [field, text] of sections) {
    if (!text) continue;

    const languageMatches = findMatches(text, GERMAN_PATTERNS);
    const contextMatches = findMatches(text, GERMANY_CONTEXT_PATTERNS);

    if (languageMatches.length || contextMatches.length) {
      recipeFindings.push({
        field,
        issues: [...languageMatches, ...contextMatches],
        text: shorten(text),
      });
    }
  }

  const missing = [];

  if (!slug) missing.push('slug');
  if (!title) missing.push('title');
  if (!getPlainText(fields.description)) missing.push('description');

  if (steps.length === 0 && !getPlainText(fields.instructions)) {
    missing.push('steps/instructions');
  }

  if (!getPlainText(fields.seoTitle)) {
    missing.push('seoTitle');
  }

  if (!getPlainText(fields.seoDescription)) {
    missing.push('seoDescription');
  }

  if (recipeFindings.length || missing.length) {
    findings.push({
      id: recipe.sys.id,
      slug: slug || null,
      title: title || null,
      issues: recipeFindings,
      missing,
    });
  }
}

findings.sort((a, b) =>
  String(a.slug || '').localeCompare(String(b.slug || ''))
);

const report = {
  generatedAt: new Date().toISOString(),
  auditedLocale: 'en',
  totalRecipes: recipes.length,
  recipesWithFindings: findings.length,
  findings,
};

const outputPath = path.join(
  '/tmp',
  'hansik-english-recipe-content-audit.json'
);

await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`English recipes audited: ${recipes.length}`);
console.log(`Recipes with findings: ${findings.length}`);
console.log(`Report: ${outputPath}`);
console.log('');

for (const recipe of findings) {
  console.log(`===== ${recipe.slug || recipe.id} =====`);
  console.log(`Title: ${recipe.title || '(missing)'}`);

  if (recipe.missing.length) {
    console.log(`Missing: ${recipe.missing.join(', ')}`);
  }

  for (const issue of recipe.issues) {
    console.log(`- ${issue.field}: ${issue.issues.join(', ')}`);
    console.log(`  ${issue.text}`);
  }

  console.log('');
}

if (findings.length > 0) {
  process.exitCode = 1;
}
