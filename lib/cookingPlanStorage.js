export const COOKING_PLAN_STORAGE_KEY = 'hansikyoung:cooking-plan:v1';

const EMPTY_COOKING_PLAN = {
  version: 1,
  recipeIds: [],
  checkedIngredientIds: [],
  updatedAt: null,
};

const uniqueStrings = (values) =>
  [...new Set(Array.isArray(values) ? values : [])].filter(
    (value) => typeof value === 'string' && value.trim()
  );

export const createEmptyCookingPlan = () => ({
  ...EMPTY_COOKING_PLAN,
  recipeIds: [],
  checkedIngredientIds: [],
});

export const readCookingPlan = () => {
  if (typeof window === 'undefined') {
    return createEmptyCookingPlan();
  }

  try {
    const raw = window.localStorage.getItem(COOKING_PLAN_STORAGE_KEY);

    if (!raw) {
      return createEmptyCookingPlan();
    }

    const parsed = JSON.parse(raw);

    if (parsed?.version !== 1) {
      return createEmptyCookingPlan();
    }

    return {
      version: 1,
      recipeIds: uniqueStrings(parsed.recipeIds),
      checkedIngredientIds: uniqueStrings(parsed.checkedIngredientIds),
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : null,
    };
  } catch {
    return createEmptyCookingPlan();
  }
};

export const writeCookingPlan = (plan) => {
  const normalizedPlan = {
    version: 1,
    recipeIds: uniqueStrings(plan?.recipeIds),
    checkedIngredientIds: uniqueStrings(plan?.checkedIngredientIds),
    updatedAt: Date.now(),
  };

  if (typeof window === 'undefined') {
    return normalizedPlan;
  }

  try {
    window.localStorage.setItem(
      COOKING_PLAN_STORAGE_KEY,
      JSON.stringify(normalizedPlan)
    );
  } catch {
    // Ignore storage failures.
  }

  return normalizedPlan;
};

export const addRecipeToCookingPlan = (recipeId) => {
  const plan = readCookingPlan();

  if (typeof recipeId !== 'string' || !recipeId.trim()) {
    return plan;
  }

  if (plan.recipeIds.includes(recipeId)) {
    return plan;
  }

  return writeCookingPlan({
    ...plan,
    recipeIds: [...plan.recipeIds, recipeId],
  });
};

export const removeRecipeFromCookingPlan = (recipeId) => {
  const plan = readCookingPlan();

  const recipeIds = plan.recipeIds.filter((id) => id !== recipeId);

  return writeCookingPlan({
    ...plan,
    recipeIds,
    checkedIngredientIds:
      recipeIds.length === 0 ? [] : plan.checkedIngredientIds,
  });
};

export const isRecipeInCookingPlan = (recipeId) =>
  Boolean(recipeId && readCookingPlan().recipeIds.includes(recipeId));

export const setCookingPlanIngredientChecked = (ingredientId, checked) => {
  const plan = readCookingPlan();

  if (typeof ingredientId !== 'string' || !ingredientId.trim()) {
    return plan;
  }

  const checkedIngredientIds = checked
    ? uniqueStrings([...plan.checkedIngredientIds, ingredientId])
    : plan.checkedIngredientIds.filter((id) => id !== ingredientId);

  return writeCookingPlan({
    ...plan,
    checkedIngredientIds,
  });
};

export const clearCookingPlan = () => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(COOKING_PLAN_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
};
