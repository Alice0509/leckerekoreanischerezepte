const fs = require('node:fs');
const path = require('node:path');

const SNAPSHOT_PATH = path.join(
  process.cwd(),
  '.next',
  'cache',
  'contentful-build-snapshot.json'
);

let cachedSnapshot = null;

const normalizeLocale = (locale) => (locale === 'de' ? 'de' : 'en');

const readBuildSnapshot = () => {
  if (cachedSnapshot) {
    return cachedSnapshot;
  }

  if (!fs.existsSync(SNAPSHOT_PATH)) {
    return null;
  }

  try {
    cachedSnapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
    return cachedSnapshot;
  } catch (error) {
    console.warn(
      `[contentful snapshot] Could not read ${SNAPSHOT_PATH}:`,
      error.message
    );
    return null;
  }
};

const getLocaleSnapshot = (locale) => {
  const snapshot = readBuildSnapshot();
  const mappedLocale = normalizeLocale(locale);

  return snapshot?.locales?.[mappedLocale] || null;
};

const createSingleItemResponse = (dataset, item) => {
  if (!dataset || !item) {
    return null;
  }

  return {
    items: [item],
    total: 1,
    skip: 0,
    limit: 1,
    includes: dataset.includes || {},
  };
};

const getRecipeEntriesFromSnapshot = (locale) => {
  const localeSnapshot = getLocaleSnapshot(locale);
  return localeSnapshot?.recipes?.items || null;
};

const getRecipeResponseFromSnapshot = (locale, slug) => {
  const localeSnapshot = getLocaleSnapshot(locale);
  const dataset = localeSnapshot?.recipes;

  if (!dataset?.items) {
    return null;
  }

  const normalizedSlug = `${slug || ''}`.toLowerCase();

  const item = dataset.items.find(
    (entry) => `${entry?.fields?.slug || ''}`.toLowerCase() === normalizedSlug
  );

  return createSingleItemResponse(dataset, item);
};

const getIngredientEntriesFromSnapshot = (locale) => {
  const localeSnapshot = getLocaleSnapshot(locale);
  return localeSnapshot?.ingredients?.items || null;
};

const getIngredientResponseFromSnapshot = ({
  locale,
  entryId = null,
  slug = null,
}) => {
  const localeSnapshot = getLocaleSnapshot(locale);
  const dataset = localeSnapshot?.ingredients;

  if (!dataset?.items) {
    return null;
  }

  const normalizedSlug = `${slug || ''}`.toLowerCase();

  const item = dataset.items.find((entry) => {
    if (entryId) {
      return entry?.sys?.id === entryId;
    }

    return `${entry?.fields?.slug || ''}`.toLowerCase() === normalizedSlug;
  });

  return createSingleItemResponse(dataset, item);
};

const getFavoriteResponseFromSnapshot = (locale, ingredientId) => {
  const localeSnapshot = getLocaleSnapshot(locale);
  const dataset = localeSnapshot?.favorites;

  if (!dataset?.items) {
    return null;
  }

  const items = dataset.items.filter((entry) => {
    const relatedIngredients = Array.isArray(entry?.fields?.relatedIngredients)
      ? entry.fields.relatedIngredients
      : [];

    return relatedIngredients.some(
      (ingredient) => ingredient?.sys?.id === ingredientId
    );
  });

  return {
    items,
    total: items.length,
    skip: 0,
    limit: items.length,
    includes: dataset.includes || {},
  };
};

module.exports = {
  SNAPSHOT_PATH,
  readBuildSnapshot,
  getRecipeEntriesFromSnapshot,
  getRecipeResponseFromSnapshot,
  getIngredientEntriesFromSnapshot,
  getIngredientResponseFromSnapshot,
  getFavoriteResponseFromSnapshot,
};
