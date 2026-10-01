# Contentful → Sanity migration plan

## Confirmed published Contentful inventory

- Recipes: 52
- Ingredients: 143
- RecipeIngredients: 504
- Steps: 307
- Categories: 7
- FavoriteItems: 4
- Galleries: 5
- GalleryEmbeds: 1
- Assets: 142
- Total published entries: 1023

## Reference validation

- Recipe EN/DE ingredient reference parity: 0 mismatches
- Recipe EN/DE step reference parity: 0 mismatches
- Recipe EN/DE category reference parity: 0 mismatches
- Shared RecipeIngredients between recipes: 0
- Shared Steps between recipes: 0
- Missing recipe Steps: 0
- Step ingredientsUsed ownership violations: 0
- Step ingredientsUsed references currently used: 3

## Legacy data

20 RecipeIngredient entries are not referenced by any current Recipe.
Some include historical Bibimbap/test data.

Do not delete these from Contentful during migration work.
Preserve their IDs in the migration source/archive until reviewed.

## Initial Sanity migration strategy

Keep the first migration structurally close to Contentful:

- recipe
- ingredient
- recipeIngredient
- step
- category
- favoriteItem
- gallery
- galleryEmbed

Every migrated document should preserve its source identity with:

- legacyContentfulId

## Localization strategy

Localized content remains EN/DE.

Reference relationships that have been proven identical across EN/DE
should be stored only once in Sanity.

Examples:

- recipe.ingredients -> reference[]
- recipe.steps -> reference[]
- recipe.categories -> reference[]

Localized text remains localized, for example:

- ingredient.name
- ingredient.slug
- recipe.titel
- recipe.description
- recipeIngredient.title
- recipeIngredient.quantity
- recipeIngredient.prepNote
- step.description
- step.doneWhen

## Migration principles

1. Never re-enter the 52 recipes manually.
2. Do not modify Contentful source data during migration.
3. Export source data before transformation.
4. Transform with scripts.
5. Import into Sanity.
6. Preserve Contentful IDs for traceability.
7. Validate counts, references, slugs, locales and assets automatically.
8. Keep current production on Contentful until Sanity output passes full validation.
9. Keep the existing build-snapshot/static-site architecture.
10. Switch CMS source only after migration verification passes.
