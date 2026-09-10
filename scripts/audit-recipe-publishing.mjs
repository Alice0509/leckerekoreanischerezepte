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
const LOCALES = ['en', 'de'];

const getLocalizedValue = (entry, field, locale) =>
  entry?.fields?.[field]?.[locale];

const getAnyValue = (entry, field) => {
  const raw = entry?.fields?.[field];

  if (raw == null) return null;

  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return raw;
  }

  for (const locale of LOCALES) {
    if (raw[locale] !== undefined) {
      return raw[locale];
    }
  }

  return Object.values(raw)[0] ?? null;
};

const getIds = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => item?.sys?.id)
    .filter(Boolean);

const sameIds = (a, b) =>
  a.length === b.length && a.every((id, index) => id === b[index]);

const hasValue = (value) => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const collectStrings = (input, result = []) => {
  if (typeof input === 'string') {
    result.push(input);
    return result;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      collectStrings(item, result);
    }
    return result;
  }

  if (input && typeof input === 'object') {
    for (const [key, item] of Object.entries(input)) {
      if (key === 'sys' || key === 'metadata') continue;
      collectStrings(item, result);
    }
  }

  return result;
};

const findControlCharacters = (input) => {
  const findings = [];

  for (const text of collectStrings(input)) {
    [...text].forEach((char, index) => {
      const code = char.codePointAt(0);

      if (
        (code >= 0x00 && code <= 0x08) ||
        code === 0x0b ||
        code === 0x0c ||
        (code >= 0x0e && code <= 0x1f) ||
        code === 0x7f
      ) {
        findings.push({
          code: `U+${code.toString(16).toUpperCase().padStart(4, '0')}`,
          index,
          text: JSON.stringify(text),
        });
      }
    });
  }

  return findings;
};

const fetchAllRecipes = async () => {
  const items = [];
  const limit = 1000;
  let skip = 0;

  while (true) {
    const response = await allLocalesClient.getEntries({
      content_type: 'recipe',
      include: 4,
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

const ALLOWED_HEAT_LEVELS = new Set([
  'low',
  'medium-low',
  'medium',
  'medium-high',
  'high',
]);

const recipes = await fetchAllRecipes();

const critical = [];
const warnings = [];

const addFinding = ({ severity, recipe, field, message, details = null }) => {
  const finding = {
    recipeId: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    field,
    message,
    details,
  };

  if (severity === 'critical') {
    critical.push(finding);
  } else {
    warnings.push(finding);
  }
};

const checkControlCharacters = ({ recipe, field, value }) => {
  const details = findControlCharacters(value);

  if (!details.length) return;

  addFinding({
    severity: 'critical',
    recipe,
    field,
    message: 'Contains hidden control character',
    details,
  });
};

const SUSPICIOUS_WHITESPACE_CODES = new Set([
  0x0009, // tab
  0x000a, // line feed
  0x000d, // carriage return
  0x00a0, // no-break space
  0x2007, // figure space
  0x200b, // zero-width space
  0x202f, // narrow no-break space
  0x2060, // word joiner
  0xfeff, // zero-width no-break space / BOM
]);

const checkSuspiciousWhitespace = ({ recipe, field, value }) => {
  if (typeof value !== 'string') return;

  const details = [];

  [...value].forEach((char, index) => {
    const code = char.codePointAt(0);

    if (SUSPICIOUS_WHITESPACE_CODES.has(code)) {
      details.push({
        code: `U+${code.toString(16).toUpperCase().padStart(4, '0')}`,
        index,
        text: JSON.stringify(value),
      });
    }
  });

  if (!details.length) return;

  addFinding({
    severity: 'critical',
    recipe,
    field,
    message: 'Contains suspicious whitespace or zero-width character',
    details,
  });
};

const checkOptionalLocalizedParity = ({ recipe, entry, field, label }) => {
  const enValue = getLocalizedValue(entry, field, 'en');
  const deValue = getLocalizedValue(entry, field, 'de');

  const enHas = hasValue(enValue);
  const deHas = hasValue(deValue);

  if (enHas !== deHas) {
    addFinding({
      severity: 'warning',
      recipe,
      field: label,
      message: `Optional localized field exists only in ${enHas ? 'EN' : 'DE'}`,
    });
  }
};

for (const entry of recipes) {
  const slug =
    getLocalizedValue(entry, 'slug', 'en') ||
    getLocalizedValue(entry, 'slug', 'de') ||
    entry.sys.id;

  const title =
    getLocalizedValue(entry, 'titel', 'en') ||
    getLocalizedValue(entry, 'titel', 'de') ||
    '(missing title)';

  const recipe = {
    id: entry.sys.id,
    slug,
    title,
  };

  for (const locale of LOCALES) {
    for (const field of [
      'titel',
      'description',
      'instructions',
      'seoTitle',
      'seoDescription',
    ]) {
      checkControlCharacters({
        recipe,
        field: `${field}.${locale}`,
        value: getLocalizedValue(entry, field, locale),
      });
    }
  }

  for (const locale of LOCALES) {
    for (const field of ['titel', 'slug', 'seoTitle']) {
      checkSuspiciousWhitespace({
        recipe,
        field: `${field}.${locale}`,
        value: getLocalizedValue(entry, field, locale),
      });
    }
  }

  const image = getAnyValue(entry, 'image');

  if (!Array.isArray(image) || image.length === 0) {
    addFinding({
      severity: 'critical',
      recipe,
      field: 'image',
      message: 'Recipe image is missing',
    });
  }

  const enIngredients = getLocalizedValue(entry, 'ingredients', 'en') || [];

  const deIngredients = getLocalizedValue(entry, 'ingredients', 'de') || [];

  const enIngredientIds = getIds(enIngredients);
  const deIngredientIds = getIds(deIngredients);

  if (!enIngredientIds.length) {
    addFinding({
      severity: 'critical',
      recipe,
      field: 'ingredients.en',
      message: 'Ingredient list is missing',
    });
  }

  if (!deIngredientIds.length) {
    addFinding({
      severity: 'critical',
      recipe,
      field: 'ingredients.de',
      message: 'Ingredient list is missing',
    });
  }

  if (
    enIngredientIds.length &&
    deIngredientIds.length &&
    !sameIds(enIngredientIds, deIngredientIds)
  ) {
    addFinding({
      severity: 'critical',
      recipe,
      field: 'ingredients',
      message: 'EN/DE ingredient lists differ in entries or order',
    });
  }

  const recipeIngredients = new Map();

  for (const recipeIngredient of [...enIngredients, ...deIngredients]) {
    if (recipeIngredient?.sys?.id) {
      recipeIngredients.set(recipeIngredient.sys.id, recipeIngredient);
    }
  }

  for (const recipeIngredient of recipeIngredients.values()) {
    const recipeIngredientId = recipeIngredient.sys.id;

    const enIngredientId =
      getLocalizedValue(recipeIngredient, 'ingredient', 'en')?.sys?.id || null;

    const deIngredientId =
      getLocalizedValue(recipeIngredient, 'ingredient', 'de')?.sys?.id || null;

    if (!enIngredientId || !deIngredientId) {
      addFinding({
        severity: 'critical',
        recipe,
        field: `recipeIngredient.${recipeIngredientId}.ingredient`,
        message: 'Ingredient reference is missing in EN or DE',
      });
    } else if (enIngredientId !== deIngredientId) {
      addFinding({
        severity: 'critical',
        recipe,
        field: `recipeIngredient.${recipeIngredientId}.ingredient`,
        message: 'EN/DE point to different Ingredient entries',
      });
    }

    for (const locale of LOCALES) {
      const ingredientEntry = getLocalizedValue(
        recipeIngredient,
        'ingredient',
        locale
      );

      if (!ingredientEntry?.fields) {
        addFinding({
          severity: 'critical',
          recipe,
          field: `recipeIngredient.${recipeIngredientId}.ingredient.${locale}`,
          message: 'Ingredient reference is unresolved',
        });

        continue;
      }

      for (const field of ['name', 'slug']) {
        const value = getLocalizedValue(ingredientEntry, field, locale);

        if (!hasValue(value)) {
          addFinding({
            severity: 'critical',
            recipe,
            field: `ingredient.${ingredientEntry.sys.id}.${field}.${locale}`,
            message: `Ingredient ${field} is missing`,
          });
        } else {
          checkSuspiciousWhitespace({
            recipe,
            field: `ingredient.${ingredientEntry.sys.id}.${field}.${locale}`,
            value,
          });
        }
      }
    }

    for (const locale of LOCALES) {
      for (const field of ['title', 'quantity', 'prepNote']) {
        checkControlCharacters({
          recipe,
          field: `recipeIngredient.${recipeIngredientId}.${field}.${locale}`,
          value: getLocalizedValue(recipeIngredient, field, locale),
        });
      }
    }

    for (const locale of LOCALES) {
      for (const field of ['title', 'quantity', 'prepNote']) {
        checkSuspiciousWhitespace({
          recipe,
          field: `recipeIngredient.${recipeIngredientId}.${field}.${locale}`,
          value: getLocalizedValue(recipeIngredient, field, locale),
        });
      }
    }

    checkOptionalLocalizedParity({
      recipe,
      entry: recipeIngredient,
      field: 'quantity',
      label: `recipeIngredient.${recipeIngredientId}.quantity`,
    });

    checkOptionalLocalizedParity({
      recipe,
      entry: recipeIngredient,
      field: 'prepNote',
      label: `recipeIngredient.${recipeIngredientId}.prepNote`,
    });
  }

  const enSteps = getLocalizedValue(entry, 'steps', 'en') || [];
  const deSteps = getLocalizedValue(entry, 'steps', 'de') || [];

  const enStepIds = getIds(enSteps);
  const deStepIds = getIds(deSteps);

  if (
    (enStepIds.length || deStepIds.length) &&
    !sameIds(enStepIds, deStepIds)
  ) {
    addFinding({
      severity: 'critical',
      recipe,
      field: 'steps',
      message: 'EN/DE step lists differ in entries or order',
    });
  }

  const steps = new Map();

  for (const step of [...enSteps, ...deSteps]) {
    if (step?.sys?.id) {
      steps.set(step.sys.id, step);
    }
  }

  const stepNumbers = [];

  for (const step of steps.values()) {
    const stepNumber = getAnyValue(step, 'stepNumber');

    if (!Number.isInteger(stepNumber) || stepNumber <= 0) {
      addFinding({
        severity: 'critical',
        recipe,
        field: `step.${step.sys.id}.stepNumber`,
        message: `Invalid stepNumber: ${JSON.stringify(stepNumber)}`,
      });
    } else {
      stepNumbers.push(stepNumber);
    }

    for (const locale of LOCALES) {
      const description = getLocalizedValue(step, 'description', locale);

      if (!hasValue(description)) {
        addFinding({
          severity: 'critical',
          recipe,
          field: `step.${step.sys.id}.description.${locale}`,
          message: 'Step description is missing',
        });
      }

      checkControlCharacters({
        recipe,
        field: `step.${step.sys.id}.description.${locale}`,
        value: description,
      });

      checkControlCharacters({
        recipe,
        field: `step.${step.sys.id}.doneWhen.${locale}`,
        value: getLocalizedValue(step, 'doneWhen', locale),
      });
    }

    checkSuspiciousWhitespace({
      recipe,
      field: `step.${step.sys.id}.stepName`,
      value: getAnyValue(step, 'stepName'),
    });

    checkSuspiciousWhitespace({
      recipe,
      field: `step.${step.sys.id}.heatLevel`,
      value: getAnyValue(step, 'heatLevel'),
    });

    for (const locale of LOCALES) {
      checkSuspiciousWhitespace({
        recipe,
        field: `step.${step.sys.id}.doneWhen.${locale}`,
        value: getLocalizedValue(step, 'doneWhen', locale),
      });
    }

    checkOptionalLocalizedParity({
      recipe,
      entry: step,
      field: 'doneWhen',
      label: `step.${step.sys.id}.doneWhen`,
    });

    const ingredientsUsed = getAnyValue(step, 'ingredientsUsed');

    for (const usedId of getIds(ingredientsUsed)) {
      if (!recipeIngredients.has(usedId)) {
        addFinding({
          severity: 'critical',
          recipe,
          field: `step.${step.sys.id}.ingredientsUsed`,
          message: `References RecipeIngredient not present in recipe: ${usedId}`,
        });
      }
    }

    const timerDuration = getAnyValue(step, 'timerDuration');

    if (
      timerDuration != null &&
      (!Number.isInteger(timerDuration) || timerDuration <= 0)
    ) {
      addFinding({
        severity: 'critical',
        recipe,
        field: `step.${step.sys.id}.timerDuration`,
        message: `Invalid timerDuration: ${JSON.stringify(timerDuration)}`,
      });
    }

    const heatLevel = getAnyValue(step, 'heatLevel');

    if (
      heatLevel &&
      ALLOWED_HEAT_LEVELS.size &&
      !ALLOWED_HEAT_LEVELS.has(heatLevel)
    ) {
      addFinding({
        severity: 'critical',
        recipe,
        field: `step.${step.sys.id}.heatLevel`,
        message: `Unexpected heat level: ${heatLevel}`,
      });
    }
  }

  if (new Set(stepNumbers).size !== stepNumbers.length) {
    addFinding({
      severity: 'critical',
      recipe,
      field: 'steps.stepNumber',
      message: 'Duplicate step numbers',
    });
  }

  const sortedNumbers = [...stepNumbers].sort((a, b) => a - b);

  if (
    sortedNumbers.length &&
    sortedNumbers.some((number, index) => number !== index + 1)
  ) {
    addFinding({
      severity: 'warning',
      recipe,
      field: 'steps.stepNumber',
      message: `Step numbers are not continuous: ${sortedNumbers.join(', ')}`,
    });
  }
}

critical.sort(
  (a, b) => a.slug.localeCompare(b.slug) || a.field.localeCompare(b.field)
);

warnings.sort(
  (a, b) => a.slug.localeCompare(b.slug) || a.field.localeCompare(b.field)
);

const report = {
  generatedAt: new Date().toISOString(),
  recipesAudited: recipes.length,
  criticalFindings: critical.length,
  warnings: warnings.length,
  ALLOWED_HEAT_LEVELS: [...ALLOWED_HEAT_LEVELS],
  critical,
  warningFindings: warnings,
};

const outputPath = path.join('/tmp', 'hansik-recipe-publishing-audit.json');

await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log('===== RECIPE PUBLISHING AUDIT =====');
console.log(`Recipes audited: ${recipes.length}`);
console.log(`Critical findings: ${critical.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log(
  `Allowed heat levels: ${
    [...ALLOWED_HEAT_LEVELS].join(', ') || '(none configured)'
  }`
);
console.log(`Report: ${outputPath}`);

if (critical.length) {
  console.log('\n===== CRITICAL =====');

  for (const item of critical) {
    console.log(`- ${item.slug} | ${item.field} | ${item.message}`);

    if (item.details) {
      for (const detail of item.details) {
        console.log(
          `  ${detail.code} at index ${detail.index}: ${detail.text}`
        );
      }
    }
  }
}

if (warnings.length) {
  console.log('\n===== WARNINGS =====');

  for (const item of warnings) {
    console.log(`- ${item.slug} | ${item.field} | ${item.message}`);
  }
}

if (critical.length > 0) {
  process.exitCode = 1;
}
