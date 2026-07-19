import fs from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';
import { createClient } from 'contentful';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!SPACE_ID || !ACCESS_TOKEN) {
  throw new Error('CONTENTFUL_SPACE_ID oder CONTENTFUL_ACCESS_TOKEN fehlt.');
}

const client = createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
});

const TARGET_LOCALE = 'de';
const FALLBACK_LOCALE = 'en';

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

const getLocalizedValue = (entry, fieldName, locale) =>
  entry?.fields?.[fieldName]?.[locale];

const getLocalizedText = (entry, fieldName, locale) =>
  getPlainText(getLocalizedValue(entry, fieldName, locale));

const shorten = (text, length = 260) => {
  if (text.length <= length) return text;
  return `${text.slice(0, length - 3).trim()}...`;
};

/*
 * Klare englische Satzfragmente.
 * Einzelne koreanische Rezeptnamen oder international gebräuchliche
 * Zutatennamen sollen möglichst nicht als Fehler gelten.
 */
const ENGLISH_BODY_PATTERNS = [
  {
    label: 'English sentence',
    regex:
      /\b(this recipe|today i|i usually|i personally|i like|i love|if you|you can|you may|you will|make sure|let it|serve with|perfect for|works well|easy to|feel free|according to|right before serving)\b/i,
  },
  {
    label: 'English cooking instruction',
    regex:
      /\b(add the|mix the|stir the|heat the|cook for|boil for|simmer for|slice the|cut the|chop the|rinse the|soak the|remove from heat|serve immediately|enjoy your)\b/i,
  },
  {
    label: 'English section heading',
    regex:
      /\b(description|instructions|ingredients|directions|preparation|pro tips|search tags|step \d+)\b/i,
  },
];

/*
 * H1-Titel können koreanische Namen enthalten.
 * Diese Liste kennzeichnet nur Titel, die wahrscheinlich noch einen
 * englischen beschreibenden Zusatz besitzen. Das ist ein Review-Hinweis,
 * kein automatischer Fehler.
 */
const ENGLISH_TITLE_PATTERNS = [
  {
    label: 'Likely English title wording',
    regex:
      /\b(recipe|how to|cooking guide|easy|simple|korean style|korean-style|stir-fried|steamed eggs?|braised|spicy|sweet|side dish|dipping sauce|salad dressing|boiled potatoes?|pork ribs?|fish cakes?|red bean bread|chocolate cookies?|waffles?)\b/i,
  },
];

const findMatches = (text, patterns) =>
  patterns.filter(({ regex }) => regex.test(text)).map(({ label }) => label);

const fetchAllRecipes = async () => {
  const limit = 1000;
  let skip = 0;
  const items = [];

  while (true) {
    const response = await client.withAllLocales.getEntries({
      content_type: 'recipe',
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
  const id = recipe.sys.id;

  const deSlug = getLocalizedText(recipe, 'slug', TARGET_LOCALE);
  const enSlug = getLocalizedText(recipe, 'slug', FALLBACK_LOCALE);
  const slug = deSlug || enSlug || id;

  const deTitle = getLocalizedText(recipe, 'titel', TARGET_LOCALE);
  const enTitle = getLocalizedText(recipe, 'titel', FALLBACK_LOCALE);

  const deDescription = getLocalizedText(recipe, 'description', TARGET_LOCALE);
  const deInstructions = getLocalizedText(
    recipe,
    'instructions',
    TARGET_LOCALE
  );
  const deSeoTitle = getLocalizedText(recipe, 'seoTitle', TARGET_LOCALE);
  const deSeoDescription = getLocalizedText(
    recipe,
    'seoDescription',
    TARGET_LOCALE
  );

  const deSteps = getLocalizedValue(recipe, 'steps', TARGET_LOCALE) || [];

  const enSteps = getLocalizedValue(recipe, 'steps', FALLBACK_LOCALE) || [];

  const sections = [
    ['title', deTitle],
    ['description', deDescription],
    ['instructions', deInstructions],
    ['seoTitle', deSeoTitle],
    ['seoDescription', deSeoDescription],
  ];

  deSteps.forEach((step, index) => {
    const stepNumber =
      getLocalizedText(step, 'stepNumber', TARGET_LOCALE) || index + 1;

    sections.push([
      `step ${stepNumber}`,
      getLocalizedText(step, 'description', TARGET_LOCALE),
    ]);
  });

  const issues = [];
  const warnings = [];
  const missing = [];
  const fallbackFromEnglish = [];

  for (const [field, text] of sections) {
    if (!text) continue;

    const bodyMatches = findMatches(text, ENGLISH_BODY_PATTERNS);

    if (bodyMatches.length) {
      issues.push({
        field,
        issues: bodyMatches,
        text: shorten(text),
      });
    }
  }

  const titleMatches = findMatches(deTitle, ENGLISH_TITLE_PATTERNS);

  if (titleMatches.length) {
    warnings.push({
      field: 'title',
      issues: titleMatches,
      text: shorten(deTitle),
    });
  }

  const seoTitleMatches = findMatches(deSeoTitle, ENGLISH_TITLE_PATTERNS);

  if (seoTitleMatches.length) {
    warnings.push({
      field: 'seoTitle',
      issues: seoTitleMatches,
      text: shorten(deSeoTitle),
    });
  }

  if (deTitle && /\S\(/.test(deTitle)) {
    warnings.push({
      field: 'title',
      issues: ['Missing space before parenthesis'],
      text: shorten(deTitle),
    });
  }

  if (
    deTitle &&
    slug !== 'belgian-style-waffles' &&
    /\p{Extended_Pictographic}/u.test(deTitle)
  ) {
    warnings.push({
      field: 'title',
      issues: ['Emoji in title'],
      text: shorten(deTitle),
    });
  }

  if (deTitle && deTitle.length > 85) {
    warnings.push({
      field: 'title',
      issues: [`Long H1 title (${deTitle.length} characters)`],
      text: shorten(deTitle),
    });
  }

  if (deSeoTitle) {
    if (deSeoTitle.length < 25) {
      warnings.push({
        field: 'seoTitle',
        issues: [`Short SEO title (${deSeoTitle.length} characters)`],
        text: deSeoTitle,
      });
    }

    if (deSeoTitle.length > 65) {
      warnings.push({
        field: 'seoTitle',
        issues: [`Long SEO title (${deSeoTitle.length} characters)`],
        text: deSeoTitle,
      });
    }
  }

  if (deSeoDescription) {
    if (deSeoDescription.length < 110) {
      warnings.push({
        field: 'seoDescription',
        issues: [
          `Short SEO description (${deSeoDescription.length} characters)`,
        ],
        text: deSeoDescription,
      });
    }

    if (deSeoDescription.length > 170) {
      warnings.push({
        field: 'seoDescription',
        issues: [
          `Long SEO description (${deSeoDescription.length} characters)`,
        ],
        text: shorten(deSeoDescription),
      });
    }
  }

  const checkRequiredField = (fieldName, germanText, englishText) => {
    if (germanText) return;

    missing.push(`${fieldName} (de)`);

    if (englishText) {
      fallbackFromEnglish.push(fieldName);
    }
  };

  checkRequiredField('slug', deSlug, enSlug);
  checkRequiredField('title', deTitle, enTitle);

  checkRequiredField(
    'description',
    deDescription,
    getLocalizedText(recipe, 'description', FALLBACK_LOCALE)
  );

  checkRequiredField(
    'seoTitle',
    deSeoTitle,
    getLocalizedText(recipe, 'seoTitle', FALLBACK_LOCALE)
  );

  checkRequiredField(
    'seoDescription',
    deSeoDescription,
    getLocalizedText(recipe, 'seoDescription', FALLBACK_LOCALE)
  );

  if (deSteps.length === 0 && !deInstructions) {
    missing.push('steps/instructions (de)');

    if (enSteps.length > 0) {
      fallbackFromEnglish.push('steps');
    } else if (getLocalizedText(recipe, 'instructions', FALLBACK_LOCALE)) {
      fallbackFromEnglish.push('instructions');
    }
  }

  for (const [index, step] of deSteps.entries()) {
    const deStepDescription = getLocalizedText(
      step,
      'description',
      TARGET_LOCALE
    );

    const enStepDescription = getLocalizedText(
      step,
      'description',
      FALLBACK_LOCALE
    );

    if (!deStepDescription) {
      missing.push(`step ${index + 1} description (de)`);

      if (enStepDescription) {
        fallbackFromEnglish.push(`step ${index + 1}`);
      }
    }
  }

  if (
    issues.length ||
    warnings.length ||
    missing.length ||
    fallbackFromEnglish.length
  ) {
    findings.push({
      id,
      slug,
      title: deTitle || enTitle || null,
      issues,
      warnings,
      missing,
      fallbackFromEnglish,
    });
  }
}

findings.sort((a, b) =>
  String(a.slug || '').localeCompare(String(b.slug || ''), 'de')
);

const recipesWithMissingSeo = findings.filter((recipe) =>
  recipe.missing.some(
    (item) => item.startsWith('seoTitle') || item.startsWith('seoDescription')
  )
).length;

const recipesWithEnglishIssues = findings.filter(
  (recipe) => recipe.issues.length > 0
).length;

const recipesWithTitleWarnings = findings.filter((recipe) =>
  recipe.warnings.some(
    (warning) => warning.field === 'title' || warning.field === 'seoTitle'
  )
).length;

const recipesWithLengthWarnings = findings.filter((recipe) =>
  recipe.warnings.some((warning) =>
    warning.issues.some((issue) =>
      /SEO title|SEO description|H1 title/.test(issue)
    )
  )
).length;

const report = {
  generatedAt: new Date().toISOString(),
  auditedLocale: TARGET_LOCALE,
  totalRecipes: recipes.length,
  recipesWithFindings: findings.length,
  summary: {
    recipesWithMissingSeo,
    recipesWithEnglishIssues,
    recipesWithTitleWarnings,
    recipesWithLengthWarnings,
  },
  findings,
};

const outputPath = path.join('/tmp', 'hansik-german-recipe-content-audit.json');

await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`German recipes audited: ${recipes.length}`);
console.log(`Recipes with findings: ${findings.length}`);
console.log(`Recipes with missing German SEO: ${recipesWithMissingSeo}`);
console.log(
  `Recipes with English-language issues: ${recipesWithEnglishIssues}`
);
console.log(`Recipes with title review warnings: ${recipesWithTitleWarnings}`);
console.log(`Recipes with length warnings: ${recipesWithLengthWarnings}`);
console.log(`Report: ${outputPath}`);
console.log('');

for (const recipe of findings) {
  console.log(`===== ${recipe.slug || recipe.id} =====`);
  console.log(`Title: ${recipe.title || '(missing)'}`);

  if (recipe.missing.length) {
    console.log(`Missing: ${recipe.missing.join(', ')}`);
  }

  if (recipe.fallbackFromEnglish.length) {
    console.log(
      `English fallback active for: ${recipe.fallbackFromEnglish.join(', ')}`
    );
  }

  for (const issue of recipe.issues) {
    console.log(`- ${issue.field}: ${issue.issues.join(', ')}`);
    console.log(`  ${issue.text}`);
  }

  for (const warning of recipe.warnings) {
    console.log(`- ${warning.field} review: ${warning.issues.join(', ')}`);
    console.log(`  ${warning.text}`);
  }

  console.log('');
}

if (findings.length > 0) {
  process.exitCode = 1;
}
