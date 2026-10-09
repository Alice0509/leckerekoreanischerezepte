const { getPurchaseLinks } = require('./purchaseLinks.cjs');
const {
  getIngredientShoppingGuide,
} = require('./ingredientShoppingGuides.cjs');

const shops = {
  'goasia.net': 'go asia',
  'handokmall.de': 'Handokmall',
  'dawayo.de': 'Dawayo',
  'y-mart.de': 'Y-Mart',
  'knuspr.de': 'Knuspr',
  'dae-yang.online': 'Dae Yang',
};
const contexts = {
  '6UtM3RzGdcXMGoWfBnju27': {
    ingredient: 'yangjo-ganjang',
    en: 'This note is about the 501S bottle shown here. Check the exact product line when comparing naturally brewed soy sauces.',
    de: 'Diese Notiz bezieht sich auf die gezeigte 501S-Flasche. Beim Vergleich natürlich gebrauter Sojasaucen die genaue Produktlinie prüfen.',
  },
  '3fSQy6VaENqhbkX8XkaO5': {
    ingredient: 'jinganjang',
    recipeId: 'chat-recipe-bibim-noodle-sauce',
    en: 'The bottle in this note is Jin Gold F3. The ingredient guide also shows a Jin S product example; these are different product lines.',
    de: 'Diese Notiz zeigt Jin Gold F3. Der Zutaten-Guide zeigt auch ein Jin-S-Produktbeispiel; das sind verschiedene Produktlinien.',
  },
  V6DLUmxmv5GtfBfp0a6ov: {
    ingredient: 'sb-golden-curry-roux',
    recipeId: 'chat-recipe-japanese-golden-curry',
    en: 'This note shows the hot Karakuchi variant. Other shopping examples may have a different heat level. The linked curry recipe uses Golden Curry roux; choose your preferred heat level.',
    de: 'Diese Notiz zeigt die scharfe Karakuchi-Variante. Andere Kaufbeispiele können einen anderen Schärfegrad haben. Das verlinkte Curryrezept verwendet Golden-Curry-Blöcke; wähle den gewünschten Schärfegrad.',
  },
};

function getKitchenPickContext(id, locale, recipesById) {
  if (!Object.hasOwn(contexts, id)) return null;
  const context = contexts[id];
  let recipe = null;
  if (context.recipeId) {
    const entry = recipesById[context.recipeId];
    if (!entry?.slug || !entry?.titel) {
      throw new Error(
        `Missing published kitchen pick recipe: ${locale}/${context.recipeId}`
      );
    }
    recipe = { slug: entry.slug, title: entry.titel };
  }
  return {
    ingredient: context.ingredient,
    note: context[locale === 'de' ? 'de' : 'en'],
    recipe,
  };
}

// Classify the original shop before affiliate resolution: a tracking hostname
// does not establish delivery region or the retailer's identity.
function getKitchenPickLinks(rawLinks, locale, options) {
  return (Array.isArray(rawLinks) ? rawLinks : []).flatMap((source) => {
    const link = getPurchaseLinks([source], locale, options)[0];
    if (!link) return [];
    const host = new URL(source.trim()).hostname.replace(/^www\./, '');
    return [
      {
        ...link,
        shopName: shops[host] || host,
        region: Object.hasOwn(shops, host) ? 'DE' : 'other',
      },
    ];
  });
}
// Curated existing ingredient product examples are separate from personal use
// notes. Publish only links that pass the existing exact-URL approval resolver.
function getApprovedKitchenOptions(locale, options) {
  return [
    'gochujang',
    'gochugaru',
    'sesame-oil',
    'jinganjang',
    'wheat-flour-type-550',
    'sugar',
    'cooking-oil',
    'apfelessig',
    'paniermehl',
    'azukibeanpaste',
    'sb-golden-curry-roux',
  ].flatMap((slug) => {
    const guide = getIngredientShoppingGuide(slug, locale, options);
    return guide.groups.flatMap((group) =>
      group.stores
        .filter((store) => store.link.isAffiliate)
        .map((store) => ({
          name: store.name,
          productTitle: store.productTitle,
          variantLabel: store.variantLabel,
          sourceUrl: store.sourceUrl,
          link: store.link,
          ingredient: slug,
          region: group.title,
        }))
    );
  });
}

module.exports = {
  getKitchenPickContext,
  getKitchenPickLinks,
  getApprovedKitchenOptions,
};
