const { getPurchaseLinks } = require('./purchaseLinks.cjs');

const shoppingTerms = {
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
};

// Resolve shopping destinations during the static build, just like CMS links.
// These are shop starting points, not verified product listings or endorsements.
function getIngredientShoppingGuide(slug, locale, purchaseOptions) {
  if (!Object.hasOwn(shoppingTerms, slug)) return null;
  const isGerman = locale === 'de';
  const language = isGerman ? 'de' : 'en';
  const isFlour = slug === 'wheat-flour-type-550';
  const term = shoppingTerms[slug][language];
  const stores = (items) =>
    items.map((item) => ({
      name: item.name,
      label: item.label,
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
            : 'Suche im Asia-Markt vor Ort oder in einem Asia-Onlineshop. Prüfe das aktuelle Sortiment, Versandkosten und die Lieferung an deine Adresse.',
          stores: stores(
            isFlour
              ? [
                  {
                    name: 'REWE',
                    label: 'REWE-Shop öffnen',
                    url: 'https://www.rewe.de/',
                  },
                ]
              : [
                  {
                    name: 'Asiafoodland',
                    label: 'Asiafoodland-Shop öffnen',
                    url: 'https://www.asiafoodland.de/',
                  },
                ]
          ),
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
          : 'Start with a local Korean, Japanese or other Asian grocery store, or an online shop that delivers to your country.',
        stores: [],
      },
      ...(!isFlour
        ? [
            {
              region: 'US',
              title: 'United States',
              note: 'Weee! is a US shopping option. Check delivery for your ZIP code and the current product selection before ordering.',
              stores: stores([
                {
                  name: 'Weee!',
                  label: 'Browse Weee! (US)',
                  url: 'https://www.sayweee.com/',
                },
              ]),
            },
          ]
        : []),
    ],
  };
}

module.exports = { getIngredientShoppingGuide };
