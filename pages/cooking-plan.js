import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createEmptyCookingPlan,
  readCookingPlan,
  removeRecipeFromCookingPlan,
  setCookingPlanIngredientChecked,
  writeCookingPlan,
} from '../lib/cookingPlanStorage';
import styles from '../styles/CookingPlan.module.css';

export async function getStaticProps({ locale }) {
  const mappedLocale = locale === 'de' ? 'de' : 'en';
  const cookingPlanData = require('../lib/generated-cooking-plan-data.json');

  return {
    props: {
      recipeCatalog: cookingPlanData[mappedLocale]?.recipesById || {},
    },
  };
}

export default function CookingPlanPage({ recipeCatalog }) {
  const router = useRouter();
  const mappedLocale = router.locale === 'de' ? 'de' : 'en';

  const [plan, setPlan] = useState(createEmptyCookingPlan());
  const [hasLoaded, setHasLoaded] = useState(false);
  const shoppingTouchStartRef = useRef(null);

  useEffect(() => {
    setPlan(readCookingPlan());
    setHasLoaded(true);
  }, []);

  const selectedRecipes = useMemo(
    () =>
      plan.recipeIds.map((recipeId) => recipeCatalog[recipeId]).filter(Boolean),
    [plan.recipeIds, recipeCatalog]
  );

  const shoppingIngredients = useMemo(() => {
    const groups = new Map();

    for (const recipe of selectedRecipes) {
      for (const ingredient of recipe.ingredients || []) {
        if (!ingredient.ingredientId) continue;

        if (!groups.has(ingredient.ingredientId)) {
          groups.set(ingredient.ingredientId, {
            ingredientId: ingredient.ingredientId,
            name: ingredient.name,
            uses: [],
          });
        }

        groups.get(ingredient.ingredientId).uses.push({
          recipeId: recipe.id,
          recipeTitle: recipe.titel,
          recipeIngredientId: ingredient.recipeIngredientId,
          quantity: ingredient.quantity,
        });
      }
    }

    return [...groups.values()].sort((a, b) =>
      a.name.localeCompare(b.name, mappedLocale)
    );
  }, [selectedRecipes, mappedLocale]);

  const checkedShoppingCount = shoppingIngredients.filter((ingredient) =>
    plan.checkedIngredientIds.includes(ingredient.ingredientId)
  ).length;

  const handleRemoveRecipe = (recipeId) => {
    const nextPlan = removeRecipeFromCookingPlan(recipeId);

    const remainingIngredientIds = new Set(
      nextPlan.recipeIds.flatMap((remainingRecipeId) =>
        (recipeCatalog[remainingRecipeId]?.ingredients || []).map(
          (ingredient) => ingredient.ingredientId
        )
      )
    );

    setPlan(
      writeCookingPlan({
        ...nextPlan,
        checkedIngredientIds: nextPlan.checkedIngredientIds.filter(
          (ingredientId) => remainingIngredientIds.has(ingredientId)
        ),
      })
    );
  };

  const handleShoppingIngredientToggle = (ingredientId) => {
    const checked = !plan.checkedIngredientIds.includes(ingredientId);

    setPlan(setCookingPlanIngredientChecked(ingredientId, checked));
  };

  const handleShoppingTouchStart = (event, ingredientId) => {
    const touch = event.touches[0];

    shoppingTouchStartRef.current = {
      ingredientId,
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleShoppingTouchEnd = (event, ingredientId) => {
    const start = shoppingTouchStartRef.current;
    shoppingTouchStartRef.current = null;

    if (!start || start.ingredientId !== ingredientId) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    const checked = plan.checkedIngredientIds.includes(ingredientId);

    if (deltaX > 0 && !checked) {
      setPlan(setCookingPlanIngredientChecked(ingredientId, true));
    }

    if (deltaX < 0 && checked) {
      setPlan(setCookingPlanIngredientChecked(ingredientId, false));
    }
  };

  const handleShoppingTouchCancel = () => {
    shoppingTouchStartRef.current = null;
  };

  const handleShoppingReset = () => {
    setPlan(
      writeCookingPlan({
        ...plan,
        checkedIngredientIds: [],
      })
    );
  };

  const copy =
    mappedLocale === 'de'
      ? {
          pageTitle: 'Mein Kochplan | Hansik Young',
          eyebrow: 'Für deine nächste Kochrunde',
          title: 'Mein Kochplan',
          intro:
            'Sammle mehrere Rezepte an einem Ort. Als Nächstes entsteht daraus deine gemeinsame Einkaufsliste.',
          count: (count) =>
            count === 1 ? '1 Rezept geplant' : `${count} Rezepte geplant`,
          remove: 'Entfernen',
          openRecipe: 'Rezept öffnen',
          emptyTitle: 'Dein Kochplan ist noch leer.',
          emptyText:
            'Füge auf einer Rezeptseite Gerichte hinzu, die du zusammen kochen möchtest.',
          browse: 'Rezepte entdecken',
          loading: 'Kochplan wird geladen …',
          shoppingEyebrow: 'Alles für deine Gerichte',
          shoppingTitle: 'Gemeinsame Einkaufsliste',
          shoppingIntro:
            'Gleiche Zutaten werden zusammengefasst. Die Mengen bleiben pro Rezept getrennt.',
          shoppingProgress: (checked, total) =>
            checked === total && total > 0
              ? 'Alles abgehakt ✓'
              : `${checked} von ${total} abgehakt`,
          resetShopping: 'Zurücksetzen',
          usedFor: 'Für',
          checkedItems: (count) => `Erledigt (${count})`,
        }
      : {
          pageTitle: 'My Cooking Plan | Hansik Young',
          eyebrow: 'For your next cooking session',
          title: 'My Cooking Plan',
          intro:
            'Keep several recipes together in one place. Next, they will become one combined shopping list.',
          count: (count) =>
            count === 1 ? '1 recipe planned' : `${count} recipes planned`,
          remove: 'Remove',
          openRecipe: 'Open recipe',
          emptyTitle: 'Your cooking plan is empty.',
          emptyText:
            'Add dishes from recipe pages when you want to cook them together.',
          browse: 'Browse recipes',
          loading: 'Loading your cooking plan …',
          shoppingEyebrow: 'Everything for your recipes',
          shoppingTitle: 'Combined Shopping List',
          shoppingIntro:
            'Shared ingredients are grouped together. Quantities stay separate for each recipe.',
          shoppingProgress: (checked, total) =>
            checked === total && total > 0
              ? 'All checked ✓'
              : `${checked} of ${total} checked`,
          resetShopping: 'Reset',
          usedFor: 'For',
          checkedItems: (count) => `Checked (${count})`,
        };

  return (
    <>
      <Head>
        <title>{copy.pageTitle}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className={styles.intro}>{copy.intro}</p>
        </section>

        {!hasLoaded ? (
          <div className={styles.statusCard}>{copy.loading}</div>
        ) : selectedRecipes.length === 0 ? (
          <section className={styles.emptyState}>
            <h2>{copy.emptyTitle}</h2>
            <p>{copy.emptyText}</p>
            <Link href="/" className={styles.primaryLink}>
              {copy.browse}
            </Link>
          </section>
        ) : (
          <section className={styles.planSection}>
            <div className={styles.sectionHeader}>
              <h2>{copy.count(selectedRecipes.length)}</h2>
            </div>

            <div className={styles.recipeGrid}>
              {selectedRecipes.map((recipe) => (
                <article key={recipe.id} className={styles.recipeCard}>
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className={styles.imageLink}
                    aria-label={`${copy.openRecipe}: ${recipe.titel}`}
                  >
                    <div className={styles.imageWrap}>
                      <Image
                        src={recipe.image || '/images/default.png'}
                        alt={recipe.titel}
                        fill
                        sizes="(max-width: 700px) 34vw, 220px"
                        className={styles.recipeImage}
                      />
                    </div>
                  </Link>

                  <div className={styles.recipeContent}>
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className={styles.recipeTitle}
                    >
                      {recipe.titel}
                    </Link>

                    <div className={styles.recipeActions}>
                      <Link
                        href={`/recipes/${recipe.slug}`}
                        className={styles.openRecipeLink}
                      >
                        {copy.openRecipe}
                      </Link>

                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => handleRemoveRecipe(recipe.id)}
                      >
                        {copy.remove}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <section className={styles.shoppingSection}>
              <div className={styles.shoppingHeader}>
                <div>
                  <p className={styles.eyebrow}>{copy.shoppingEyebrow}</p>
                  <h2>{copy.shoppingTitle}</h2>
                  <p className={styles.shoppingIntro}>{copy.shoppingIntro}</p>
                </div>

                <div className={styles.shoppingProgress}>
                  <span aria-live="polite">
                    {copy.shoppingProgress(
                      checkedShoppingCount,
                      shoppingIngredients.length
                    )}
                  </span>

                  {checkedShoppingCount > 0 && (
                    <button
                      type="button"
                      className={styles.shoppingResetButton}
                      onClick={handleShoppingReset}
                    >
                      {copy.resetShopping}
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.shoppingList}>
                {shoppingIngredients
                  .filter(
                    (ingredient) =>
                      !plan.checkedIngredientIds.includes(
                        ingredient.ingredientId
                      )
                  )
                  .map((ingredient) => {
                    const recipeCount = new Set(
                      ingredient.uses.map((use) => use.recipeId)
                    ).size;

                    return (
                      <article
                        key={ingredient.ingredientId}
                        className={styles.shoppingItem}
                        onTouchStart={(event) =>
                          handleShoppingTouchStart(
                            event,
                            ingredient.ingredientId
                          )
                        }
                        onTouchEnd={(event) =>
                          handleShoppingTouchEnd(event, ingredient.ingredientId)
                        }
                        onTouchCancel={handleShoppingTouchCancel}
                      >
                        <label className={styles.shoppingCheckLabel}>
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() =>
                              handleShoppingIngredientToggle(
                                ingredient.ingredientId
                              )
                            }
                            className={styles.shoppingCheckbox}
                          />

                          <span className={styles.shoppingIngredientName}>
                            {ingredient.name}
                          </span>
                        </label>

                        <ul className={styles.shoppingUses}>
                          {ingredient.uses.map((use) => (
                            <li
                              key={`${use.recipeIngredientId}-${use.recipeId}`}
                            >
                              <span className={styles.shoppingQuantity}>
                                {use.quantity}
                              </span>

                              {recipeCount > 1 && (
                                <span className={styles.shoppingRecipe}>
                                  {use.recipeTitle}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </article>
                    );
                  })}
              </div>

              {checkedShoppingCount > 0 && (
                <details className={styles.checkedSection}>
                  <summary className={styles.checkedSummary}>
                    {copy.checkedItems(checkedShoppingCount)}
                  </summary>

                  <div className={styles.checkedList}>
                    {shoppingIngredients
                      .filter((ingredient) =>
                        plan.checkedIngredientIds.includes(
                          ingredient.ingredientId
                        )
                      )
                      .map((ingredient) => {
                        const recipeCount = new Set(
                          ingredient.uses.map((use) => use.recipeId)
                        ).size;

                        return (
                          <article
                            key={ingredient.ingredientId}
                            className={`${styles.shoppingItem} ${styles.shoppingItemChecked}`}
                            onTouchStart={(event) =>
                              handleShoppingTouchStart(
                                event,
                                ingredient.ingredientId
                              )
                            }
                            onTouchEnd={(event) =>
                              handleShoppingTouchEnd(
                                event,
                                ingredient.ingredientId
                              )
                            }
                            onTouchCancel={handleShoppingTouchCancel}
                          >
                            <label className={styles.shoppingCheckLabel}>
                              <input
                                type="checkbox"
                                checked
                                onChange={() =>
                                  handleShoppingIngredientToggle(
                                    ingredient.ingredientId
                                  )
                                }
                                className={styles.shoppingCheckbox}
                              />

                              <span className={styles.shoppingIngredientName}>
                                {ingredient.name}
                              </span>
                            </label>

                            <ul className={styles.shoppingUses}>
                              {ingredient.uses.map((use) => (
                                <li
                                  key={`${use.recipeIngredientId}-${use.recipeId}`}
                                >
                                  <span className={styles.shoppingQuantity}>
                                    {use.quantity}
                                  </span>

                                  {recipeCount > 1 && (
                                    <span className={styles.shoppingRecipe}>
                                      {use.recipeTitle}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </article>
                        );
                      })}
                  </div>
                </details>
              )}
            </section>
          </section>
        )}
      </main>
    </>
  );
}
