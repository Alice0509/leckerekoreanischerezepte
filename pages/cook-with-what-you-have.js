import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  addRecipeToCookingPlan,
  readCookingPlan,
  removeRecipeFromCookingPlan,
} from '../lib/cookingPlanStorage';
import {
  clearCookWithWhatYouHaveIngredients,
  readCookWithWhatYouHaveIngredients,
  writeCookWithWhatYouHaveIngredients,
} from '../lib/cookWithWhatYouHaveStorage';
import styles from '../styles/CookWithWhatYouHave.module.css';

const PANTRY_STAPLE_SLUGS = new Set([
  'water',
  'salt',
  'sugar',
  'cooking-oil',
  'pepper',
]);

export async function getStaticProps({ locale }) {
  const mappedLocale = locale === 'de' ? 'de' : 'en';
  const data = require('../lib/generated-cooking-plan-data.json');
  const recipes = Object.values(data[mappedLocale]?.recipesById || {});

  const ingredientMap = new Map();

  const recipeCatalog = recipes.map((recipe) => {
    const uniqueIngredients = new Map();

    for (const ingredient of recipe.ingredients || []) {
      if (!ingredient.ingredientId) continue;
      if (PANTRY_STAPLE_SLUGS.has(ingredient.slug)) continue;

      if (!uniqueIngredients.has(ingredient.ingredientId)) {
        uniqueIngredients.set(ingredient.ingredientId, {
          id: ingredient.ingredientId,
          name: ingredient.name,
          slug: ingredient.slug,
        });
      }

      if (!ingredientMap.has(ingredient.ingredientId)) {
        ingredientMap.set(ingredient.ingredientId, {
          id: ingredient.ingredientId,
          name: ingredient.name,
          slug: ingredient.slug,
          recipeIds: new Set(),
        });
      }

      ingredientMap.get(ingredient.ingredientId).recipeIds.add(recipe.id);
    }

    return {
      id: recipe.id,
      slug: recipe.slug,
      title: recipe.titel,
      image: recipe.image,
      ingredients: [...uniqueIngredients.values()],
    };
  });

  const ingredientCatalog = [...ingredientMap.values()]
    .map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      slug: ingredient.slug,
      recipeCount: ingredient.recipeIds.size,
    }))
    .sort(
      (a, b) =>
        b.recipeCount - a.recipeCount ||
        a.name.localeCompare(b.name, mappedLocale)
    );

  return {
    props: {
      ingredientCatalog,
      recipeCatalog,
    },
  };
}

export default function CookWithWhatYouHavePage({
  ingredientCatalog,
  recipeCatalog,
}) {
  const router = useRouter();
  const mappedLocale = router.locale === 'de' ? 'de' : 'en';

  const [query, setQuery] = useState('');
  const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);
  const [plannedRecipeIds, setPlannedRecipeIds] = useState([]);

  useEffect(() => {
    setSelectedIngredientIds(readCookWithWhatYouHaveIngredients());
    setPlannedRecipeIds(readCookingPlan().recipeIds);
  }, []);

  const selectedSet = useMemo(
    () => new Set(selectedIngredientIds),
    [selectedIngredientIds]
  );

  const ingredientById = useMemo(
    () =>
      Object.fromEntries(
        ingredientCatalog.map((ingredient) => [ingredient.id, ingredient])
      ),
    [ingredientCatalog]
  );

  const popularIngredients = useMemo(
    () =>
      ingredientCatalog
        .filter((ingredient) => !selectedSet.has(ingredient.id))
        .slice(0, 12),
    [ingredientCatalog, selectedSet]
  );

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(mappedLocale);

    if (!normalizedQuery) return [];

    return ingredientCatalog
      .filter((ingredient) => !selectedSet.has(ingredient.id))
      .filter((ingredient) => {
        const name = ingredient.name.toLocaleLowerCase(mappedLocale);
        const slug = ingredient.slug.toLocaleLowerCase(mappedLocale);

        return name.includes(normalizedQuery) || slug.includes(normalizedQuery);
      })
      .slice(0, 10);
  }, [query, ingredientCatalog, selectedSet, mappedLocale]);

  const matchedRecipes = useMemo(() => {
    if (selectedIngredientIds.length === 0) return [];

    const totalRecipeCount = recipeCatalog.length;

    const getIngredientWeight = (ingredientId) => {
      const recipeCount = ingredientById[ingredientId]?.recipeCount || 0;

      return Math.log((totalRecipeCount + 1) / (recipeCount + 1)) + 1;
    };

    const selectedWeightTotal = selectedIngredientIds.reduce(
      (total, ingredientId) => total + getIngredientWeight(ingredientId),
      0
    );

    return recipeCatalog
      .map((recipe) => {
        const matchedIngredients = recipe.ingredients.filter((ingredient) =>
          selectedSet.has(ingredient.id)
        );

        const missingIngredients = recipe.ingredients.filter(
          (ingredient) => !selectedSet.has(ingredient.id)
        );

        const matchedWeight = matchedIngredients.reduce(
          (total, ingredient) => total + getIngredientWeight(ingredient.id),
          0
        );

        return {
          ...recipe,
          matchedIngredients,
          missingIngredients,
          matchedCount: matchedIngredients.length,
          missingCount: missingIngredients.length,
          weightedCoverage:
            selectedWeightTotal > 0 ? matchedWeight / selectedWeightTotal : 0,
        };
      })
      .filter((recipe) => recipe.matchedCount > 0)
      .sort(
        (a, b) =>
          b.weightedCoverage - a.weightedCoverage ||
          a.missingCount - b.missingCount ||
          b.matchedCount - a.matchedCount ||
          a.title.localeCompare(b.title, mappedLocale)
      )
      .slice(0, 8);
  }, [
    recipeCatalog,
    selectedSet,
    selectedIngredientIds,
    ingredientById,
    mappedLocale,
  ]);

  const bestMatches = matchedRecipes.slice(0, 4);
  const moreMatches = matchedRecipes.slice(4);

  const addIngredient = (ingredientId) => {
    setSelectedIngredientIds((current) => {
      const nextIds = current.includes(ingredientId)
        ? current
        : [...current, ingredientId];

      return writeCookWithWhatYouHaveIngredients(nextIds);
    });

    setQuery('');
  };

  const removeIngredient = (ingredientId) => {
    setSelectedIngredientIds((current) =>
      writeCookWithWhatYouHaveIngredients(
        current.filter((id) => id !== ingredientId)
      )
    );
  };

  const clearSelectedIngredients = () => {
    clearCookWithWhatYouHaveIngredients();
    setSelectedIngredientIds([]);
  };

  const handleCookingPlanToggle = (recipeId) => {
    const nextPlan = plannedRecipeIds.includes(recipeId)
      ? removeRecipeFromCookingPlan(recipeId)
      : addRecipeToCookingPlan(recipeId);

    setPlannedRecipeIds(nextPlan.recipeIds);
  };

  const copy =
    mappedLocale === 'de'
      ? {
          pageTitle: 'Kochen mit vorhandenen Zutaten | Hansik Young',
          eyebrow: 'Was ist schon zu Hause?',
          title: 'Koche mit dem, was du da hast',
          intro:
            'Wähle Zutaten aus, die du bereits hast. Wir zeigen dir Rezepte, die mit möglichst wenigen zusätzlichen Zutaten auskommen.',
          pantryNote:
            'Wir gehen davon aus, dass Wasser, Salz, Zucker, Pfeffer und neutrales Speiseöl vorhanden sind.',
          searchLabel: 'Zutat suchen',
          searchPlaceholder: 'z. B. Kimchi, Ei, Tofu …',
          popular: 'Beliebt in unseren Rezepten',
          selected: 'Deine Zutaten',
          clear: 'Alle entfernen',
          emptySelected:
            'Wähle oben mindestens eine Zutat aus, um passende Rezepte zu sehen.',
          results: 'Beste Treffer',
          matchesLabel: 'Passt zu',
          moreIdeas: (count) => `Weitere Ideen (${count})`,
          missing: (count) =>
            count === 0
              ? 'Keine weiteren Zutaten nötig'
              : count === 1
                ? '1 weitere Zutat nötig'
                : `${count} weitere Zutaten nötig`,
          missingLabel: 'Noch nötig',
          openRecipe: 'Rezept öffnen',
          addToPlan: '+ Zum Kochplan',
          inPlan: '✓ Im Kochplan',
          noMatches:
            'Noch kein naher Treffer. Wähle eine weitere Zutat aus oder ändere deine Auswahl.',
        }
      : {
          pageTitle: 'Cook with What You Have | Hansik Young',
          eyebrow: 'What is already in your kitchen?',
          title: 'Cook with what you have',
          intro:
            'Choose ingredients you already have. We’ll show recipes that need as few additional ingredients as possible.',
          pantryNote:
            'We assume you already have water, salt, sugar, pepper and neutral cooking oil.',
          searchLabel: 'Search ingredients',
          searchPlaceholder: 'e.g. kimchi, egg, tofu …',
          popular: 'Popular in our recipes',
          selected: 'Your ingredients',
          clear: 'Clear all',
          emptySelected:
            'Choose at least one ingredient above to see matching recipes.',
          results: 'Best matches',
          matchesLabel: 'Matches',
          moreIdeas: (count) => `More ideas (${count})`,
          missing: (count) =>
            count === 0
              ? 'No additional ingredients needed'
              : count === 1
                ? '1 more ingredient needed'
                : `${count} more ingredients needed`,
          missingLabel: 'Still need',
          openRecipe: 'Open recipe',
          addToPlan: '+ Add to Cooking Plan',
          inPlan: '✓ In Cooking Plan',
          noMatches:
            'No close match yet. Add another ingredient or change your selection.',
        };

  const renderRecipeCard = (recipe) => (
    <article key={recipe.id} className={styles.recipeCard}>
      <Link href={`/recipes/${recipe.slug}`} className={styles.imageLink}>
        <div className={styles.imageWrap}>
          <Image
            src={recipe.image || '/images/default.png'}
            alt={recipe.title}
            fill
            sizes="(max-width: 700px) 34vw, 220px"
            className={styles.recipeImage}
          />
        </div>
      </Link>

      <div className={styles.recipeContent}>
        <Link href={`/recipes/${recipe.slug}`} className={styles.recipeTitle}>
          {recipe.title}
        </Link>

        <div className={styles.matchMeta}>
          <strong className={styles.matchesLine}>
            {copy.matchesLabel}:{' '}
            {recipe.matchedIngredients
              .map((ingredient) => ingredient.name)
              .join(' · ')}
          </strong>
          <span>{copy.missing(recipe.missingCount)}</span>
        </div>

        {recipe.missingIngredients.length > 0 && (
          <div className={styles.missingBlock}>
            <span className={styles.missingLabel}>{copy.missingLabel}</span>

            <p>
              {recipe.missingIngredients
                .slice(0, 4)
                .map((ingredient) => ingredient.name)
                .join(', ')}
              {recipe.missingIngredients.length > 4
                ? ` +${recipe.missingIngredients.length - 4}`
                : ''}
            </p>
          </div>
        )}

        <div className={styles.recipeActions}>
          <Link href={`/recipes/${recipe.slug}`} className={styles.openRecipe}>
            {copy.openRecipe} →
          </Link>

          <button
            type="button"
            className={`${styles.planButton} ${
              plannedRecipeIds.includes(recipe.id)
                ? styles.planButtonActive
                : ''
            }`}
            aria-pressed={plannedRecipeIds.includes(recipe.id)}
            onClick={() => handleCookingPlanToggle(recipe.id)}
          >
            {plannedRecipeIds.includes(recipe.id)
              ? copy.inPlan
              : copy.addToPlan}
          </button>
        </div>
      </div>
    </article>
  );

  return (
    <>
      <Head>
        <title>{copy.pageTitle}</title>
        <meta
          name="description"
          content={
            mappedLocale === 'de'
              ? 'Finde koreanische Rezepte mit Zutaten, die du bereits zu Hause hast.'
              : 'Find Korean recipes you can make with ingredients you already have.'
          }
        />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className={styles.intro}>{copy.intro}</p>
        </section>

        <section className={styles.selector}>
          <label className={styles.searchLabel} htmlFor="ingredient-search">
            {copy.searchLabel}
          </label>

          <div className={styles.searchWrap}>
            <input
              id="ingredient-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className={styles.searchInput}
              autoComplete="off"
            />

            {query.trim() && (
              <div className={styles.searchResults}>
                {searchResults.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    type="button"
                    className={styles.searchResult}
                    onClick={() => addIngredient(ingredient.id)}
                  >
                    <span>{ingredient.name}</span>
                    <small>{ingredient.recipeCount}</small>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className={styles.pantryNote}>{copy.pantryNote}</p>

          <div className={styles.popularSection}>
            <p className={styles.sectionLabel}>{copy.popular}</p>

            <div className={styles.chipList}>
              {popularIngredients.map((ingredient) => (
                <button
                  key={ingredient.id}
                  type="button"
                  className={styles.ingredientChip}
                  onClick={() => addIngredient(ingredient.id)}
                >
                  + {ingredient.name}
                </button>
              ))}
            </div>
          </div>

          {selectedIngredientIds.length > 0 && (
            <div className={styles.selectedSection}>
              <div className={styles.selectedHeader}>
                <p className={styles.sectionLabel}>
                  {copy.selected} ({selectedIngredientIds.length})
                </p>

                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={clearSelectedIngredients}
                >
                  {copy.clear}
                </button>
              </div>

              <div className={styles.chipList}>
                {selectedIngredientIds.map((ingredientId) => {
                  const ingredient = ingredientById[ingredientId];

                  if (!ingredient) return null;

                  return (
                    <button
                      key={ingredient.id}
                      type="button"
                      className={styles.selectedChip}
                      onClick={() => removeIngredient(ingredient.id)}
                    >
                      {ingredient.name} ×
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {selectedIngredientIds.length === 0 ? (
          <section className={styles.emptyState}>
            <p>{copy.emptySelected}</p>
          </section>
        ) : (
          <section className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <h2>{copy.results}</h2>
              <span>{bestMatches.length}</span>
            </div>

            {matchedRecipes.length === 0 ? (
              <div className={styles.noMatches}>{copy.noMatches}</div>
            ) : (
              <>
                <div className={styles.recipeGrid}>
                  {bestMatches.map(renderRecipeCard)}
                </div>

                {moreMatches.length > 0 && (
                  <details className={styles.moreIdeas}>
                    <summary className={styles.moreIdeasSummary}>
                      {copy.moreIdeas(moreMatches.length)}
                    </summary>

                    <div className={styles.moreIdeasGrid}>
                      {moreMatches.map(renderRecipeCard)}
                    </div>
                  </details>
                )}
              </>
            )}
          </section>
        )}
      </main>
    </>
  );
}
