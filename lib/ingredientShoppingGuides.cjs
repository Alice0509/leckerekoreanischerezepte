const { getPurchaseLinks } = require('./purchaseLinks.cjs');
const shoppingProducts = require('./ingredientShoppingProducts.json');

const supermarketTerms = {
  sugar: { de: 'weißer Haushaltszucker', en: 'white granulated sugar' },
  'cooking-oil': {
    de: 'neutrales Speiseöl / Rapsöl',
    en: 'neutral cooking oil',
  },
  apfelessig: { de: 'Apfelessig', en: 'apple cider vinegar' },
  paniermehl: { de: 'Paniermehl / Panko', en: 'breadcrumbs / panko' },
};

const shoppingTerms = {
  ...supermarketTerms,
  'wheat-flour-type-550': {
    de: 'Weizenmehl Type 550',
    en: 'flour suitable for buns and rolls',
  },
  azukibeanpaste: {
    de: 'gesüßte Azuki-Bohnenpaste / Anko',
    en: 'sweet red bean paste / anko',
  },
  'sb-golden-curry-roux': {
    de: 'S&B Golden Curry in Blöcken',
    en: 'S&B Golden Curry roux blocks',
  },
  gochujang: { de: 'Gochujang-Chilipaste', en: 'gochujang paste' },
  gochugaru: {
    de: 'Gochugaru / koreanische Chiliflocken',
    en: 'gochugaru / Korean chili flakes',
  },
  'sesame-oil': {
    de: 'geröstetes Sesamöl / Chamgireum',
    en: 'toasted sesame oil / chamgireum',
  },
  jinganjang: {
    de: 'Jin-Ganjang / koreanische Sojasauce',
    en: 'Jin Ganjang soy sauce',
  },
};

// Resolve shopping destinations during the static build, just like CMS links.
// Keep product titles and variant notes visible independently of affiliate labels.
function getIngredientShoppingGuide(slug, locale, purchaseOptions) {
  if (!Object.hasOwn(shoppingTerms, slug)) return null;
  const isGerman = locale === 'de';
  const language = isGerman ? 'de' : 'en';
  const isFlour = slug === 'wheat-flour-type-550';
  const isSupermarket = isFlour || Object.hasOwn(supermarketTerms, slug);
  const term = shoppingTerms[slug][language];
  const stores = (items) =>
    items.map((item) => ({
      name: item.name,
      productTitle: item.productTitle,
      note: item.note,
      variantLabel: item.variantLabel || '',
      sourceUrl: item.url,
      label: isGerman
        ? `Produkt bei ${item.name} ansehen`
        : `View product at ${item.name}`,
      link: getPurchaseLinks([item.url], language, purchaseOptions)[0],
    }));

  if (isGerman) {
    return {
      title: 'Einkaufsmöglichkeiten in Deutschland',
      intro: `Suchbegriff im Shop: ${term}. Vergleiche Produktart, Packungsgröße und Zutaten mit dem Rezept.`,
      groups: [
        {
          region: 'DE',
          title: 'Deutschland',
          note: isFlour
            ? 'Prüfe bei REWE das Sortiment für deinen Markt sowie Liefer- oder Abholmöglichkeiten. Achte auf Type 550 auf der Packung.'
            : isSupermarket
              ? 'Diese Zutat findest du meist im Supermarkt. Prüfe bei REWE das Sortiment für deinen Markt sowie Liefer- oder Abholmöglichkeiten. Vergleiche die genaue Produktart mit dem Rezept.'
              : 'Suche im Asia-Markt vor Ort oder in einem Asia-Onlineshop. Prüfe das aktuelle Sortiment, Versandkosten und die Lieferung an deine Adresse.',
          stores: stores(shoppingProducts[slug]?.de || []),
        },
      ],
    };
  }

  return {
    title: 'Find a shop in your country',
    intro: `Search term: ${term}. Compare the product type, package size and ingredients with the recipe.`,
    groups: [
      {
        region: 'local',
        title: 'Your country',
        note: isFlour
          ? 'Start with a local supermarket or flour supplier. Flour names vary by country; check the flour guide above when choosing an alternative to Type 550.'
          : isSupermarket
            ? 'Start with a local supermarket in your country. Compare the product type and ingredients with the recipe; pack sizes and names can vary.'
            : 'Start with a local Korean, Japanese or other Asian grocery store, or an online shop that delivers to your country.',
        stores: [],
      },
      ...(!isFlour && shoppingProducts[slug]?.en?.length
        ? [
            {
              region: 'US',
              title: 'United States',
              note: 'Weee! is a US shopping option. Check delivery for your ZIP code and the current product selection before ordering.',
              stores: stores(shoppingProducts[slug]?.en || []),
            },
          ]
        : []),
    ],
  };
}

module.exports = { getIngredientShoppingGuide };
