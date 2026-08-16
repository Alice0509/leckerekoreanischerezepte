export const INGREDIENT_DETAIL_FALLBACK_SLUGS = [
  'cooked-rice',
  'dangmyeon',
  'doenjang',
  'gim',
  'gochugaru',
  'gochujang',
  'jonggakimchi',
  'kimchi',
  'kimchi-stir-fry',
  'klebreismehl',
  'la-monegasque-sesame-oil',
  'ottogi-sesame-oil',
  'rice',
  'sesame-oil',
  'sesame-seeds',
  'soybean-sprouts',
  'sushi-rice',
  'toasted-sesame-seeds',
  'tofu',
  'tteokbokki-tteok',
];

export const INDEXABLE_INGREDIENT_SLUGS = [
  'cooked-rice',
  'daepa',
  'dangmyeon',
  'doenjang',
  'gim',
  'gochugaru',
  'gochujang',
  'gukganjang',
  'jinganjang',
  'jonggakimchi',
  'kimchi',
  'kimchi-stir-fry',
  'klebreismehl',
  'la-monegasque-sesame-oil',
  'ottogi-sesame-oil',
  'rice',
  'sesame-oil',
  'sesame-seeds',
  'soybean-sprouts',
  'sushi-rice',
  'toasted-sesame-seeds',
  'tofu',
  'tteokbokki-tteok',
  'yangjo-ganjang',
];

const detailFallbackSlugs = new Set(INGREDIENT_DETAIL_FALLBACK_SLUGS);

const indexableIngredientSlugs = new Set(INDEXABLE_INGREDIENT_SLUGS);

const normalizeIngredientSlug = (slug = '') => `${slug}`.trim().toLowerCase();

const collectIngredientDetailText = (value) => {
  if (!value) return [];

  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectIngredientDetailText);
  }

  if (typeof value === 'object') {
    const parts = [];

    if (typeof value.value === 'string') {
      parts.push(value.value);
    }

    if (Array.isArray(value.content)) {
      parts.push(...collectIngredientDetailText(value.content));
    }

    return parts;
  }

  return [];
};

export const getIngredientDetailText = (description) =>
  collectIngredientDetailText(description)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

export const hasIngredientDetailContent = (description) =>
  getIngredientDetailText(description).length > 0;

export const isIngredientDetailFallbackSlug = (slug = '') =>
  detailFallbackSlugs.has(normalizeIngredientSlug(slug));

export const isIndexableIngredientSlug = (slug = '') =>
  indexableIngredientSlugs.has(normalizeIngredientSlug(slug));

export const hasIngredientDetailPage = ({
  slug = '',
  description = null,
} = {}) =>
  Boolean(
    slug &&
      (isIndexableIngredientSlug(slug) ||
        isIngredientDetailFallbackSlug(slug) ||
        hasIngredientDetailContent(description))
  );
