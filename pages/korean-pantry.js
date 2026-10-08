import Link from 'next/link';
import { NextSeo } from 'next-seo';
import RecipeCard from '../components/RecipeCard';
import PurchaseLink from '../components/PurchaseLink';
import AffiliateDisclosure from '../components/AffiliateDisclosure';
import { getSeoUrls } from '../lib/siteUrls';
import pantryStarter from '../lib/pantryStarter.cjs';
import buildSnapshot from '../lib/contentfulBuildSnapshot.cjs';
import shoppingGuides from '../lib/ingredientShoppingGuides.cjs';
import styles from '../styles/PantryStarter.module.css';

export function getStaticProps({ locale }) {
  const language = locale === 'de' ? 'de' : 'en';
  const cookingData = require('../lib/generated-cooking-plan-data.json');
  const guide = pantryStarter.getPantryStarter({
    locale: language,
    ingredientEntries:
      buildSnapshot.getIngredientEntriesFromSnapshot(language) || [],
    recipesById: cookingData[language]?.recipesById || {},
  });
  return {
    props: {
      ...guide,
      ingredients: guide.ingredients.map((ingredient) => ({
        ...ingredient,
        shoppingGuide: shoppingGuides.getIngredientShoppingGuide(
          ingredient.slug,
          language
        ),
      })),
    },
  };
}

export default function PantryStarter({ locale, copy, ingredients, recipes }) {
  const urls = getSeoUrls({ locale, path: '/korean-pantry' });
  const hasAffiliateLinks = ingredients.some((ingredient) =>
    ingredient.shoppingGuide?.groups.some((group) =>
      group.stores.some((store) => store.link.isAffiliate)
    )
  );
  return (
    <>
      <NextSeo
        title={copy.title}
        description={copy.description}
        canonical={urls.canonicalUrl}
        languageAlternates={Object.entries(urls.alternateUrls).map(
          ([language, href]) => ({
            hrefLang: language === 'xDefault' ? 'x-default' : language,
            href,
          })
        )}
        openGraph={{
          title: copy.title,
          description: copy.description,
          url: urls.canonicalUrl,
        }}
      />
      <main className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1>{copy.heading}</h1>
          <p>{copy.intro}</p>
          <a className={styles.action} href="#first-recipes">
            {copy.jump}
          </a>
        </header>
        <section aria-labelledby="pantry-basics">
          <h2 id="pantry-basics">{copy.basics}</h2>
          {hasAffiliateLinks && <AffiliateDisclosure locale={locale} />}
          <div className={styles.basics}>
            {ingredients.map((ingredient) => (
              <article key={ingredient.id} className={styles.card}>
                <h3>{ingredient.name}</h3>
                <p>{ingredient.use}</p>
                <dl>
                  <dt>{copy.choosing}</dt>
                  <dd>{ingredient.choosing}</dd>
                  <dt>{copy.substitution}</dt>
                  <dd>{ingredient.substitution}</dd>
                  <dt>{copy.storage}</dt>
                  <dd>{ingredient.storage}</dd>
                </dl>
                <Link
                  className={styles.textLink}
                  href={`/ingredients/${ingredient.slug}`}
                >
                  {copy.details} →
                </Link>
                {ingredient.shoppingGuide && (
                  <details className={styles.products}>
                    <summary>{copy.productOptions}</summary>
                    {ingredient.shoppingGuide.groups.map((group) => (
                      <div key={group.region}>
                        <h4>{group.title}</h4>
                        <p>{group.note}</p>
                        {group.stores.map((store) => (
                          <div
                            key={`${store.name}:${store.productTitle}`}
                            className={styles.product}
                          >
                            <p>
                              <strong>{store.productTitle}</strong>
                            </p>
                            <p>{store.note}</p>
                            <PurchaseLink
                              link={store.link}
                              locale={locale}
                              className={styles.textLink}
                            >
                              {store.label} →
                            </PurchaseLink>
                          </div>
                        ))}
                      </div>
                    ))}
                  </details>
                )}
              </article>
            ))}
          </div>
        </section>
        <section className={styles.section} aria-labelledby="first-recipes">
          <h2 id="first-recipes">{copy.recipes}</h2>
          <p>{copy.recipesIntro}</p>
          <div className={styles.recipes}>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
        <section className={styles.shopping} aria-labelledby="pantry-shopping">
          <h2 id="pantry-shopping">{copy.shoppingHeading}</h2>
          <ol>
            {copy.shoppingSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className={styles.actions}>
            <Link className={styles.action} href="/cooking-plan">
              {copy.plan}
            </Link>
            <Link className={styles.textLink} href="/cook-with-what-you-have">
              {copy.finder} →
            </Link>
          </div>
        </section>
        <section className={styles.section}>
          <h2>
            {locale === 'de'
              ? 'Mit deiner Küche anfangen'
              : 'Start with the kitchen you have'}
          </h2>
          <p>
            {locale === 'de'
              ? 'Welche Küchenhelfer brauchst du wirklich? Prüfe die Grundausstattung und erfahre, welche Extras warten können.'
              : 'Which tools do you actually need? Check the basics and see which extras can wait.'}
          </p>
          <Link className={styles.textLink} href="/korean-kitchen-tools">
            {locale === 'de' ? 'Küchenhelfer ansehen' : 'Explore kitchen tools'}{' '}
            →
          </Link>
        </section>
        <section className={styles.section}>
          <h2>{copy.countryHeading}</h2>
          <p>{copy.countryText}</p>
          <Link className={styles.textLink} href="/ingredients">
            {copy.allIngredients} →
          </Link>
        </section>
      </main>
    </>
  );
}
