const {
  getIngredientShoppingGuide,
} = require('./ingredientShoppingGuides.cjs');

// Select only ingredients actually used by this recipe. Resolve exact product
// URLs at build time so inactive affiliate destinations never reach page props.
function getRecipeShoppingIngredients(ingredients, locale, purchaseOptions) {
  const seen = new Set();
  return (Array.isArray(ingredients) ? ingredients : []).flatMap(
    (ingredient) => {
      if (!ingredient?.slug || seen.has(ingredient.slug)) return [];
      const guide = getIngredientShoppingGuide(
        ingredient.slug,
        locale,
        purchaseOptions
      );
      if (!guide) return [];
      seen.add(ingredient.slug);
      return [
        {
          slug: ingredient.slug,
          name: ingredient.name,
          groups: guide.groups
            .map(({ region, title, stores }) => ({
              region,
              title,
              stores: stores
                .filter((store) => store.link)
                .map(
                  ({ name, productTitle, variantLabel, sourceUrl, link }) => ({
                    name,
                    productTitle,
                    variantLabel,
                    sourceUrl,
                    link,
                  })
                ),
            }))
            .filter((group) => group.stores.length > 0),
        },
      ];
    }
  );
}

module.exports = { getRecipeShoppingIngredients };
