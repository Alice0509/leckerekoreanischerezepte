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

export const isPriorityIngredientSlug = (slug = '') => {
  const normalized = `${slug}`.toLowerCase();

  return PRIORITY_INGREDIENT_SLUG_KEYWORDS.some((keyword) =>
    normalized.includes(keyword)
  );
};
