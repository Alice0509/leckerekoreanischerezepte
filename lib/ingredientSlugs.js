const INGREDIENT_SLUG_DEFINITIONS = [
  {
    primaryEntryId: 'cjt4N0pZJ12wUS55QvobE',
    memberEntryIds: ['cjt4N0pZJ12wUS55QvobE'],
    slug: 'tofu',
    aliases: [' Tofu', 'Tofu'],
  },
  {
    primaryEntryId: '565tNcixoYvuQrW8JAku01',
    memberEntryIds: ['565tNcixoYvuQrW8JAku01', '2ydA0j8PoVJFlKmCaXWYTQ'],
    slug: 'cooked-rice',
    aliases: ['Cooked-rice', 'Cooked rice', 'gekochter Reis', 'gekochter-reis'],
  },
  {
    primaryEntryId: '31qLwPpZYSKIi7ZpC41EZp',
    memberEntryIds: ['31qLwPpZYSKIi7ZpC41EZp'],
    slug: 'gochujang',
    aliases: ['Gochujang'],
  },
  {
    primaryEntryId: '4VCUgo7h3dh3Smy7rDGx1n',
    memberEntryIds: ['4VCUgo7h3dh3Smy7rDGx1n'],
    slug: 'ottogi-sesame-oil',
    aliases: ['OttogiSesameOil'],
  },
  {
    primaryEntryId: 'shlldn8xv5DD87UVszZAG',
    memberEntryIds: ['shlldn8xv5DD87UVszZAG'],
    slug: 'la-monegasque-sesame-oil',
    aliases: ['LaMonegasqueSesamöl ', 'LaMonegasqueSesamöl'],
  },
  {
    primaryEntryId: '73EkitIwlloJi833oN3p3U',
    memberEntryIds: ['73EkitIwlloJi833oN3p3U'],
    slug: 'wheat-flour-type-550',
    aliases: ['Typ 550', 'typ-550'],
  },
  {
    primaryEntryId: '3UNJI2jJli2CZHpX2QdJIq',
    memberEntryIds: ['3UNJI2jJli2CZHpX2QdJIq'],
    slug: 'chicken-stock-powder',
    aliases: ['Hühnerbrühepulver', 'huehnerbruehepulver', 'chicken-stock'],
  },
  {
    primaryEntryId: '1IMDrOPalteTacrwdYQFmN',
    memberEntryIds: ['1IMDrOPalteTacrwdYQFmN'],
    slug: 'beef-chuck-or-stewing-beef',
    aliases: ['hochrippe', 'Beef (chuck or stewing beef)'],
  },
  {
    primaryEntryId: '6a03K2Ebi1XFzmqr0sTUFB',
    memberEntryIds: ['6a03K2Ebi1XFzmqr0sTUFB'],
    slug: 'chicken-pieces',
    aliases: ['Hähnchenstücke', 'haehnchenstuecke', 'Chicken pieces'],
  },
  {
    primaryEntryId: '2R17EI2xSLr8sDzleHSwP',
    memberEntryIds: ['2R17EI2xSLr8sDzleHSwP'],
    slug: 'mixed-ground-beef-and-pork',
    aliases: [
      'gemischtes Hackfleisch, Rind und Schwein',
      'gemischtes-hackfleisch-rind-und-schwein',
      'mixed ground beef and pork',
    ],
  },
  {
    primaryEntryId: '1qiOTp7Fy60GMeRryfTzwa',
    memberEntryIds: ['1qiOTp7Fy60GMeRryfTzwa'],
    slug: 'shiitake-or-button-mushrooms',
    aliases: [
      'shiitake-oder-champignon-pilze',
      'Shiitake- oder Champignon-Pilze',
    ],
  },
  {
    primaryEntryId: '7KVhksdKg8Y87fI6HlGIkq',
    memberEntryIds: ['7KVhksdKg8Y87fI6HlGIkq'],
    slug: 'enoki-mushrooms',
    aliases: ['enoki-pilze'],
  },
];

const decodeSlug = (value) => {
  try {
    return decodeURIComponent(String(value || ''));
  } catch {
    return String(value || '');
  }
};

export const normalizeIngredientSlug = (value) =>
  decodeSlug(value)
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
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const DEFINITION_BY_ENTRY_ID = new Map();
const DEFINITION_BY_SLUG = new Map();

for (const definition of INGREDIENT_SLUG_DEFINITIONS) {
  for (const entryId of definition.memberEntryIds) {
    DEFINITION_BY_ENTRY_ID.set(entryId, definition);
  }

  for (const slug of [definition.slug, ...definition.aliases]) {
    DEFINITION_BY_SLUG.set(normalizeIngredientSlug(slug), definition);
  }
}

export const getCanonicalIngredientEntryId = (entryId) =>
  DEFINITION_BY_ENTRY_ID.get(entryId)?.primaryEntryId || entryId || '';

export const getCanonicalIngredientEntryIds = (entryId) => {
  const definition = DEFINITION_BY_ENTRY_ID.get(entryId);

  return definition?.memberEntryIds || (entryId ? [entryId] : []);
};

export const getCanonicalIngredientSlug = ({ entryId, fallbackSlug }) =>
  DEFINITION_BY_ENTRY_ID.get(entryId)?.slug || fallbackSlug || '';

export const resolveIngredientSlug = (requestedSlug) => {
  const decodedSlug = decodeSlug(requestedSlug);
  const definition = DEFINITION_BY_SLUG.get(
    normalizeIngredientSlug(decodedSlug)
  );

  if (!definition) return null;

  return {
    primaryEntryId: definition.primaryEntryId,
    memberEntryIds: definition.memberEntryIds,
    slug: definition.slug,
    shouldRedirect: decodedSlug !== definition.slug,
  };
};
