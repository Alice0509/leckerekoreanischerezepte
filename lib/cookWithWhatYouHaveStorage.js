export const COOK_WITH_WHAT_YOU_HAVE_STORAGE_KEY =
  'hansikyoung:cook-with-what-you-have:v1';

const STORAGE_TTL_MS = 48 * 60 * 60 * 1000;

const normalizeIds = (values) =>
  [...new Set(Array.isArray(values) ? values : [])].filter(
    (value) => typeof value === 'string' && value.trim()
  );

export const readCookWithWhatYouHaveIngredients = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(
      COOK_WITH_WHAT_YOU_HAVE_STORAGE_KEY
    );

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (
      parsed?.version !== 1 ||
      typeof parsed.updatedAt !== 'number' ||
      Date.now() - parsed.updatedAt > STORAGE_TTL_MS
    ) {
      window.localStorage.removeItem(COOK_WITH_WHAT_YOU_HAVE_STORAGE_KEY);
      return [];
    }

    return normalizeIds(parsed.ingredientIds);
  } catch {
    return [];
  }
};

export const writeCookWithWhatYouHaveIngredients = (ingredientIds) => {
  const normalizedIds = normalizeIds(ingredientIds);

  if (typeof window === 'undefined') return normalizedIds;

  try {
    window.localStorage.setItem(
      COOK_WITH_WHAT_YOU_HAVE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        ingredientIds: normalizedIds,
        updatedAt: Date.now(),
      })
    );
  } catch {
    // Ignore storage failures.
  }

  return normalizedIds;
};

export const clearCookWithWhatYouHaveIngredients = () => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(COOK_WITH_WHAT_YOU_HAVE_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
};
