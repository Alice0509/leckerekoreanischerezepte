const NEW_RECIPE_MS = 30 * 24 * 60 * 60 * 1000;

function validTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value))
    return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function firstPublicationDate(document) {
  if (validTimestamp(document.firstPublishedAt) !== null)
    return document.firstPublishedAt;
  // The chat tool creates the published document last, removing draft timestamps.
  // Migration dates and ordinary draft creation dates are not publication dates.
  if (
    !document.legacyContentfulId &&
    document._id?.startsWith('chat-recipe-') &&
    validTimestamp(document._createdAt) !== null
  )
    return document._createdAt;
  return null;
}

function isNewRecipe(date, now) {
  const published = validTimestamp(date);
  const current = typeof now === 'number' ? now : Date.parse(now);
  return (
    published !== null &&
    Number.isFinite(current) &&
    current >= published &&
    current - published < NEW_RECIPE_MS
  );
}

function latestRecipes(recipes, now, limit = 3) {
  const current = typeof now === 'number' ? now : Date.parse(now);
  return recipes
    .filter((recipe) => {
      const published = validTimestamp(recipe.firstPublishedAt);
      return published !== null && published <= current;
    })
    .sort(
      (a, b) =>
        Date.parse(b.firstPublishedAt) - Date.parse(a.firstPublishedAt) ||
        String(a.id).localeCompare(String(b.id))
    )
    .slice(0, limit);
}

module.exports = {
  NEW_RECIPE_MS,
  firstPublicationDate,
  isNewRecipe,
  latestRecipes,
};
