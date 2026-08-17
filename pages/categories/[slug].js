import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import RecipeCard from '../../components/RecipeCard';
import styles from '../../styles/Home.module.css';
import { getSeoUrls } from '../../lib/siteUrls';
import {
  RECIPE_CATEGORY_ORDER,
  getRecipeCategoryFromFields,
  getRecipeCategoryKeyFromSlug,
  getRecipeCategoryLabel,
  getRecipeCategorySeo,
  getRecipeCategorySlug,
} from '../../lib/recipeCategories';
import contentfulBuildSnapshot from '../../lib/contentfulBuildSnapshot.cjs';

const { readBuildSnapshot } = contentfulBuildSnapshot;

const normalizeLocale = (locale) => (locale === 'de' ? 'de' : 'en');

const normalizeAssetUrl = (url) => {
  if (!url) return null;
  return url.startsWith('//') ? `https:${url}` : url;
};

const resolveRecipeImage = (imageField, assetsMap) => {
  const image = Array.isArray(imageField) ? imageField[0] : imageField;

  if (!image) {
    return '/images/default.png';
  }

  const directUrl = normalizeAssetUrl(image.fields?.file?.url);

  if (directUrl) {
    return directUrl;
  }

  const linkedUrl = image.sys?.id
    ? normalizeAssetUrl(assetsMap.get(image.sys.id)?.fields?.file?.url)
    : null;

  return linkedUrl || '/images/default.png';
};

const CategoryHub = ({
  categorySlug,
  label,
  seo,
  recipes,
  locale,
  categoryLinks,
}) => {
  const path = `/categories/${categorySlug}`;
  const seoUrls = getSeoUrls({
    locale,
    path,
  });

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: label,
    numberOfItems: recipes.length,
    itemListElement: recipes.map((recipe, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: recipe.titel,
      url: `${seoUrls.siteOrigin}/recipes/${recipe.slug}`,
    })),
  };

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />

        <link rel="canonical" href={seoUrls.canonicalUrl} />

        <link rel="alternate" hrefLang="de" href={seoUrls.alternateUrls.de} />
        <link rel="alternate" hrefLang="en" href={seoUrls.alternateUrls.en} />
        <link
          rel="alternate"
          hrefLang="x-default"
          href={seoUrls.alternateUrls.xDefault}
        />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seoUrls.canonicalUrl} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itemListJsonLd),
          }}
        />
      </Head>

      <main className={styles.container}>
        <section className={styles.heroSection}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>
              {locale === 'de' ? 'Koreanische Rezepte' : 'Korean recipes'}
            </p>

            <h1 className={styles.heroTitle}>{label}</h1>

            <p className={styles.heroDescription}>{seo.intro}</p>

            <p>
              {locale === 'de'
                ? `${recipes.length} Rezepte in dieser Kategorie`
                : `${recipes.length} recipes in this category`}
            </p>
          </div>
        </section>

        <section className={styles.startHereSection}>
          <div className={styles.previewHeader}>
            <h2 className={styles.previewTitle}>
              {locale === 'de' ? 'Weitere Kategorien' : 'More categories'}
            </h2>
          </div>

          <div className={styles.startHereGrid}>
            {categoryLinks.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className={styles.startHereCard}
                aria-current={
                  category.slug === categorySlug ? 'page' : undefined
                }
              >
                <h3>{category.label}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.allRecipesSection}>
          <div className={styles.previewHeader}>
            <h2 className={styles.previewTitle}>
              {locale === 'de' ? `Rezepte: ${label}` : `${label} recipes`}
            </h2>
          </div>

          <div className={styles.menuGrid}>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export async function getStaticPaths({ locales }) {
  const supportedLocales = locales || ['de', 'en'];

  const paths = supportedLocales.flatMap((locale) =>
    RECIPE_CATEGORY_ORDER.map((categoryKey) => ({
      params: {
        slug: getRecipeCategorySlug(categoryKey),
      },
      locale,
    }))
  );

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params, locale }) {
  const dataLocale = normalizeLocale(locale);
  const categorySlug = String(params?.slug || '');
  const categoryKey = getRecipeCategoryKeyFromSlug(categorySlug);

  if (!categoryKey) {
    return {
      notFound: true,
    };
  }

  const snapshot = readBuildSnapshot();
  const dataset = snapshot?.locales?.[dataLocale]?.recipes;

  if (!dataset?.items) {
    console.error(`Category Hub snapshot missing for locale: ${dataLocale}`);

    return {
      notFound: true,
    };
  }

  const assetsMap = new Map(
    (dataset.includes?.Asset || []).map((asset) => [asset.sys.id, asset])
  );

  const recipes = dataset.items
    .filter((item) => {
      const category = getRecipeCategoryFromFields(
        item.fields || {},
        dataLocale
      );

      return category.key === categoryKey;
    })
    .map((item) => ({
      id: item.sys.id,
      slug: item.fields?.slug || '',
      titel:
        item.fields?.titel ||
        item.fields?.title ||
        (dataLocale === 'de' ? 'Rezept' : 'Recipe'),
      image: resolveRecipeImage(item.fields?.image, assetsMap),
      youTubeUrl: item.fields?.youTubeUrl || null,
    }))
    .filter((recipe) => recipe.slug);

  if (recipes.length === 0) {
    return {
      notFound: true,
    };
  }

  const categoryLinks = RECIPE_CATEGORY_ORDER.map((key) => ({
    slug: getRecipeCategorySlug(key),
    label: getRecipeCategoryLabel(key, dataLocale),
  }));

  return {
    props: {
      categorySlug,
      label: getRecipeCategoryLabel(categoryKey, dataLocale),
      seo: getRecipeCategorySeo(categoryKey, dataLocale),
      recipes,
      locale: dataLocale,
      categoryLinks,
    },
  };
}

export default CategoryHub;
