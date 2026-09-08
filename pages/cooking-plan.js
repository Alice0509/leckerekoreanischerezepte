import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import {
  createEmptyCookingPlan,
  readCookingPlan,
  removeRecipeFromCookingPlan,
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

  useEffect(() => {
    setPlan(readCookingPlan());
    setHasLoaded(true);
  }, []);

  const selectedRecipes = useMemo(
    () =>
      plan.recipeIds.map((recipeId) => recipeCatalog[recipeId]).filter(Boolean),
    [plan.recipeIds, recipeCatalog]
  );

  const handleRemoveRecipe = (recipeId) => {
    setPlan(removeRecipeFromCookingPlan(recipeId));
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
          </section>
        )}
      </main>
    </>
  );
}
