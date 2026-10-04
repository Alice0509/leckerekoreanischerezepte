function orderedRecipeSteps(steps, toPlainText) {
  return (Array.isArray(steps) ? steps : [])
    .filter(
      (step) =>
        step?.description && (!toPlainText || toPlainText(step.description))
    )
    .sort((a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0));
}

function isoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value))
    return undefined;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return undefined;
  const normalized = new Date(timestamp).toISOString();
  // Date.parse can silently turn an impossible day into the next month.
  if (!value.includes('T') && normalized.slice(0, 10) !== value)
    return undefined;
  return normalized;
}

function recipeSearchDetails({
  preparationTime,
  servings,
  firstPublishedAt,
  updatedDate,
  steps,
  instructions,
  canonicalUrl,
  locale,
  toPlainText,
}) {
  const minutes = Number(preparationTime);
  const roundedMinutes = Math.round(minutes);
  const totalTime =
    Number.isFinite(minutes) && roundedMinutes > 0
      ? `PT${roundedMinutes}M`
      : undefined;
  const visibleSteps = orderedRecipeSteps(steps, toPlainText);
  const recipeInstructions = visibleSteps.length
    ? visibleSteps.map((step, index) => ({
        '@type': 'HowToStep',
        text: toPlainText(step.description),
        image: step.image || undefined,
        url: `${canonicalUrl}#step-${index + 1}`,
      }))
    : toPlainText(instructions)
      ? [
          {
            '@type': 'HowToStep',
            text: toPlainText(instructions),
            url: `${canonicalUrl}#instructions`,
          },
        ]
      : undefined;

  return {
    // The CMS has one overall duration. It does not record separate prep/cook times.
    totalTime,
    recipeYield: servings
      ? `${servings} ${locale === 'de' ? 'Portionen' : 'servings'}`
      : undefined,
    // firstPublishedAt is already resolved by the snapshot's publication-date rules.
    // Never infer publication from a migration, creation or modification timestamp here.
    datePublished: isoDate(firstPublishedAt),
    dateModified: isoDate(updatedDate),
    recipeInstructions,
  };
}

function serializeRecipeSchema(schema) {
  // Recipe text is editable CMS content and must not terminate the script element.
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

module.exports = {
  orderedRecipeSteps,
  recipeSearchDetails,
  serializeRecipeSchema,
};
