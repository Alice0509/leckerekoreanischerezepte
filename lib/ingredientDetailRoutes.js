export const PRIORITY_INGREDIENT_SLUG_KEYWORDS = [
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

export const isPriorityIngredientSlug = (slug = '') => {
  const normalized = `${slug}`.toLowerCase();

  return PRIORITY_INGREDIENT_SLUG_KEYWORDS.some((keyword) =>
    normalized.includes(keyword)
  );
};

export const hasIngredientDetailPage = ({
  slug = '',
  description = null,
} = {}) =>
  Boolean(
    slug &&
      (isPriorityIngredientSlug(slug) ||
        hasIngredientDetailContent(description))
  );
