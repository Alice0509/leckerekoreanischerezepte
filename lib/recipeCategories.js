const CATEGORY_DEFINITIONS = {
  soups: {
    id: '3NWw88VFThg4qOh2cWcsv4',
    de: 'Eintöpfe & Suppen',
    en: 'Stews & soups',
  },
  riceNoodles: {
    id: '2HCHhhkHnB4b1PXkFNA6re',
    de: 'Reis & Nudeln',
    en: 'Rice & noodles',
  },
  sideDishes: {
    id: '7yj6rIPLvfnAKYEbtXJfGZ',
    de: 'Beilagen',
    en: 'Side dishes',
  },
  mainDishes: {
    id: '6lZRRDly3xFKTgvVUi1bUP',
    de: 'Hauptgerichte',
    en: 'Main dishes',
  },
  streetFood: {
    id: 'NqJXw3ssjQAEgpPxtBnXX',
    de: 'Streetfood',
    en: 'Street food',
  },
  saucesBasics: {
    id: '3QTRNQE0N96BJUaUpxP3CV',
    de: 'Saucen & Basics',
    en: 'Sauces & basics',
  },
  sweetsBaking: {
    id: '7vzRvIoPuR1UhwlABtgjNq',
    de: 'Süßes & Gebäck',
    en: 'Sweets & baking',
  },
};

export const RECIPE_CATEGORY_ORDER = [
  'soups',
  'riceNoodles',
  'sideDishes',
  'mainDishes',
  'streetFood',
  'saucesBasics',
  'sweetsBaking',
];

const CATEGORY_KEY_BY_ENTRY_ID = Object.fromEntries(
  Object.entries(CATEGORY_DEFINITIONS).map(([key, category]) => [
    category.id,
    key,
  ])
);

const normalizeLabel = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('de');

const CATEGORY_KEY_BY_LABEL = new Map();

for (const [key, category] of Object.entries(CATEGORY_DEFINITIONS)) {
  CATEGORY_KEY_BY_LABEL.set(normalizeLabel(category.de), key);
  CATEGORY_KEY_BY_LABEL.set(normalizeLabel(category.en), key);
}

const LEGACY_CATEGORY_ALIASES = {
  'street food': 'streetFood',
  'koreanische snacks & streetfood': 'streetFood',
  'korean snacks & street food': 'streetFood',
  'traditionelle koreanische küche': 'mainDishes',
  'korean home cooking': 'mainDishes',
  'authentic korean cuisine': 'mainDishes',
  'authentic korean dishes': 'mainDishes',
  'koreanische kuchen und brote': 'sweetsBaking',
  'korean cakes and bread': 'sweetsBaking',
};

for (const [label, key] of Object.entries(LEGACY_CATEGORY_ALIASES)) {
  CATEGORY_KEY_BY_LABEL.set(normalizeLabel(label), key);
}

const getLinkedCategoryEntry = (value) => {
  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value || null;
};

const getCategoryEntryLabel = (entry) => {
  if (!entry?.fields) return '';

  const possibleFields = [
    'name',
    'title',
    'titel',
    'label',
    'categoryName',
    'kategorie',
    'slug',
  ];

  for (const fieldName of possibleFields) {
    const value = entry.fields[fieldName];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const getLegacyCategoryLabel = (category) => {
  if (!category) return '';

  if (typeof category === 'string') {
    return category.trim();
  }

  if (Array.isArray(category)) {
    return category.map(getLegacyCategoryLabel).filter(Boolean).join(', ');
  }

  return (
    category.fields?.name ||
    category.fields?.title ||
    category.fields?.titel ||
    category.fields?.label ||
    ''
  );
};

export const getRecipeCategoryLabel = (key, locale) => {
  const language = locale === 'de' ? 'de' : 'en';

  return (
    CATEGORY_DEFINITIONS[key]?.[language] ||
    CATEGORY_DEFINITIONS.mainDishes[language]
  );
};

export const getRecipeCategoryFromFields = (fields = {}, locale = 'en') => {
  const linkedCategory = getLinkedCategoryEntry(fields.categories);
  const linkedEntryId = linkedCategory?.sys?.id || '';
  const linkedLabel = getCategoryEntryLabel(linkedCategory);
  const legacyLabel = getLegacyCategoryLabel(fields.category);

  const key =
    CATEGORY_KEY_BY_ENTRY_ID[linkedEntryId] ||
    CATEGORY_KEY_BY_LABEL.get(normalizeLabel(linkedLabel)) ||
    CATEGORY_KEY_BY_LABEL.get(normalizeLabel(legacyLabel)) ||
    'mainDishes';

  return {
    key,
    label: getRecipeCategoryLabel(key, locale),
    originalLabel:
      linkedLabel || legacyLabel || getRecipeCategoryLabel(key, locale),
    source: linkedEntryId ? 'categories' : 'category',
  };
};
