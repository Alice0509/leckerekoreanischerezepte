export const RECIPE_STATE_TTL_MS = 48 * 60 * 60 * 1000;

export const readPersistedCheckIds = (key) => {
  if (typeof window === 'undefined' || !key) return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!parsed?.savedAt || !Array.isArray(parsed.ids)) {
      window.localStorage.removeItem(key);
      return [];
    }

    if (Date.now() - parsed.savedAt > RECIPE_STATE_TTL_MS) {
      window.localStorage.removeItem(key);
      return [];
    }

    return parsed.ids.filter((id) => typeof id === 'string');
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage cleanup failures.
    }

    return [];
  }
};

export const writePersistedCheckIds = (key, ids) => {
  if (typeof window === 'undefined' || !key) return;

  try {
    if (!ids.length) {
      window.localStorage.removeItem(key);
      return;
    }

    window.localStorage.setItem(
      key,
      JSON.stringify({
        savedAt: Date.now(),
        ids,
      })
    );
  } catch {
    // Ignore storage write failures.
  }
};
