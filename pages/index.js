// pages/index.js
import React, { useState, useMemo, useEffect } from 'react';
import client from '../lib/contentful';
import Fuse from 'fuse.js';
import styles from '../styles/Home.module.css';
import { getSeoUrls } from '../lib/siteUrls';
import {
  RECIPE_CATEGORY_ORDER,
  getRecipeCategoryFromFields,
  getRecipeCategoryLabel,
  getRecipeCategorySlug,
} from '../lib/recipeCategories';
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';
import RecipeCard from '../components/RecipeCard';
import Head from 'next/head';

// 로케일별 데이터 캐시
const recipesCache = {};

export async function getStaticProps({ locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en';

    if (recipesCache[mappedLocale]) {
      return {
        props: {
          recipes: recipesCache[mappedLocale],
        },
      };
    }

    const recipeRes = await client.getEntries({
      content_type: 'recipe',
      locale: mappedLocale,
      include: 1,
      select:
        'fields.slug,fields.titel,fields.category,fields.categories,fields.image,fields.youTubeUrl,fields.description',
      limit: 1000,
    });

    const assetsMap = {};
    recipeRes.includes.Asset?.forEach((asset) => {
      assetsMap[asset.sys.id] = asset;
    });

    const resolveImageUrl = (imageField) => {
      const image = Array.isArray(imageField) ? imageField[0] : imageField;
      if (!image) return null;

      const directUrl = image.fields?.file?.url;
      if (directUrl) {
        return directUrl.startsWith('//') ? `https:${directUrl}` : directUrl;
      }

      const assetUrl = image.sys?.id
        ? assetsMap[image.sys.id]?.fields?.file?.url
        : null;

      if (assetUrl) {
        return assetUrl.startsWith('//') ? `https:${assetUrl}` : assetUrl;
      }

      return null;
    };

    const recipes = recipeRes.items.map((item) => {
      const imageUrl = resolveImageUrl(item.fields.image);

      let descriptionText = '';
      if (item.fields.description?.content) {
        descriptionText = item.fields.description.content
          .map((block) => {
            if (block.nodeType === 'paragraph') {
              return block.content.map((node) => node.value).join('');
            }
            return '';
          })
          .join(' ');

        if (descriptionText.length > 200) {
          descriptionText = descriptionText.substring(0, 200) + '...';
        }
      }

      const categoryData = getRecipeCategoryFromFields(
        item.fields,
        mappedLocale
      );

      return {
        id: item.sys.id,
        slug: item.fields.slug,
        titel: item.fields.titel,
        category: categoryData.label,
        categoryKey: categoryData.key,
        originalCategory: categoryData.originalLabel,
        youTubeUrl: item.fields.youTubeUrl || null,
        image: imageUrl || '/images/default.png',
        descriptionText,
      };
    });

    recipesCache[mappedLocale] = recipes;

    return {
      props: {
        recipes,
      },
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      props: {
        recipes: [],
        error: 'Failed to fetch homepage data.',
      },
    };
  }
}

const Home = ({ recipes, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const itemsPerPage = 12;
  const router = useRouter();
  const { locale, query } = router;
  const mappedLocale = locale === 'de' ? 'de-DE' : 'en-US';
  const currentPage = parseInt(query.page) || 1;

  const fuse = useMemo(
    () =>
      new Fuse(recipes, {
        keys: ['titel', 'descriptionText'],
        threshold: 0.3,
      }),
    [recipes]
  );

  const categories = useMemo(() => {
    const presentCategories = new Set(recipes.map((item) => item.categoryKey));

    return RECIPE_CATEGORY_ORDER.map((categoryKey) => ({
      key: categoryKey,
      label: getRecipeCategoryLabel(categoryKey, locale),
      slug: getRecipeCategorySlug(categoryKey),
      count: recipes.filter((item) => item.categoryKey === categoryKey).length,
    })).filter((category) => presentCategories.has(category.key));
  }, [recipes, locale]);

  const filteredItems = useMemo(() => {
    return recipes.filter((item) => {
      const matchesCategory = selectedCategory
        ? item.categoryKey === selectedCategory
        : true;
      return matchesCategory;
    });
  }, [recipes, selectedCategory]);

  const searchedItems = useMemo(() => {
    if (!searchTerm) return filteredItems;
    return fuse.search(searchTerm).map((result) => result.item);
  }, [searchTerm, fuse, filteredItems]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return searchedItems.slice(start, end);
  }, [searchedItems, currentPage, itemsPerPage]);

  const computedTotalPages = useMemo(() => {
    return Math.ceil(searchedItems.length / itemsPerPage);
  }, [searchedItems, itemsPerPage]);

  const featuredRecipes = useMemo(() => recipes.slice(0, 3), [recipes]);

  const seoCopy =
    mappedLocale === 'de-DE'
      ? {
          title:
            'Koreanische Rezepte in Deutschland | Leckere Koreanische Rezepte',
          description:
            'Einfache koreanische Hausmannskost mit Zutaten, die du in Deutschland findest: Rezepte, Zutaten-Tipps und ehrliche Küchenbasics.',
        }
      : {
          title: 'Hansik Young | Korean Home Cooking Recipes',
          description:
            'Warm Korean home cooking recipes, honest ingredient tips, and family-style dishes for everyday kitchens.',
        };

  const seoUrls = getSeoUrls({
    locale: mappedLocale === 'de-DE' ? 'de' : 'en',
    path: '/',
  });

  useEffect(() => {
    if (currentPage !== 1) {
      handlePageChange(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory]);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const handlePageChange = (pageNumber) => {
    router.push(`/?page=${pageNumber}`, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>{seoCopy.title}</title>
        <meta name="description" content={seoCopy.description} />
        <link rel="canonical" href={seoUrls.canonicalUrl} />
        <link rel="alternate" hrefLang="de" href={seoUrls.alternateUrls.de} />
        <link rel="alternate" hrefLang="en" href={seoUrls.alternateUrls.en} />
        <link
          rel="alternate"
          hrefLang="x-default"
          href={seoUrls.alternateUrls.xDefault}
        />
        <meta property="og:title" content={seoCopy.title} />
        <meta property="og:description" content={seoCopy.description} />
        <meta property="og:url" content={seoUrls.canonicalUrl} />
      </Head>

      <div className={styles.container}>
        {/* HERO */}
        <section className={styles.heroSection}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>
              {mappedLocale === 'de-DE'
                ? 'Koreanisch kochen in Deutschland'
                : 'Korean home cooking with Hansik Young'}
            </p>

            <h1 className={styles.heroTitle}>
              {mappedLocale === 'de-DE'
                ? 'Koreanische Hausmannskost mit Zutaten, die du in Deutschland findest'
                : 'Warm Korean recipes for everyday home cooking'}
            </h1>

            <p className={styles.heroDescription}>
              {mappedLocale === 'de-DE'
                ? 'Einfache koreanische Rezepte, ehrliche Zutaten-Tipps und warme Familiengerichte – gekocht in Deutschland, mit koreanischem Herzen.'
                : 'Simple Korean recipes, honest ingredient tips, and family-style dishes — made for real kitchens, wherever you live.'}
            </p>

            <div className={styles.heroButtons}>
              <a href="#all-recipes" className={styles.heroPrimaryButton}>
                {mappedLocale === 'de-DE'
                  ? 'Rezepte entdecken'
                  : 'Discover recipes'}
              </a>
              <Link href="/ingredients" className={styles.heroSecondaryButton}>
                {mappedLocale === 'de-DE'
                  ? 'Zutaten-Guide lesen'
                  : 'Read ingredient guide'}
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED RECIPES */}
        {featuredRecipes.length > 0 && (
          <section className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <h2 className={styles.previewTitle}>
                {mappedLocale === 'de-DE'
                  ? 'Rezepte aus meiner Küche'
                  : 'Recipes from My Kitchen'}
              </h2>
            </div>

            <div className={styles.featuredGrid}>
              {featuredRecipes.map((item) => (
                <RecipeCard key={item.id} recipe={item} />
              ))}
            </div>
          </section>
        )}

        {/* CATEGORY HUB LINKS */}
        <section
          className={styles.categoryHubSection}
          aria-labelledby="category-hub-title"
        >
          <div className={styles.previewHeader}>
            <h2 id="category-hub-title" className={styles.previewTitle}>
              {mappedLocale === 'de-DE'
                ? 'Rezepte nach Kategorie'
                : 'Browse recipes by category'}
            </h2>
          </div>

          <p className={styles.previewNotice}>
            {mappedLocale === 'de-DE'
              ? 'Entdecke koreanische Rezepte nach Suppen, Reis und Nudeln, Beilagen, Hauptgerichten und weiteren Kategorien.'
              : 'Explore Korean recipes by soups and stews, rice and noodles, side dishes, main dishes, and more.'}
          </p>

          <nav
            className={styles.categoryHubLinks}
            aria-label={
              mappedLocale === 'de-DE'
                ? 'Rezeptkategorien'
                : 'Recipe categories'
            }
          >
            {categories.map((category) => (
              <Link
                key={category.key}
                href={`/categories/${category.slug}`}
                className={styles.categoryHubLink}
              >
                <span>{category.label}</span>
                <span
                  className={styles.categoryHubCount}
                  aria-label={
                    mappedLocale === 'de-DE'
                      ? `${category.count} Rezepte`
                      : `${category.count} recipes`
                  }
                >
                  {category.count}
                </span>
              </Link>
            ))}
          </nav>
        </section>

        {/* ALL RECIPES */}
        <section id="all-recipes" className={styles.allRecipesSection}>
          <div className={styles.previewHeader}>
            <h2 className={styles.previewTitle}>
              {mappedLocale === 'de-DE' ? 'Alle Rezepte' : 'All Recipes'}
            </h2>
          </div>

          <div className={styles.controlsContainer}>
            <div className={styles.filterContainer}>
              <select
                id="categorySelect"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.categorySelect}
              >
                <option value="">
                  {mappedLocale === 'de-DE' ? 'Kategorie' : 'Category'}
                </option>
                {categories.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.searchContainer}>
              <FaSearch className={styles.icon} />
              <input
                type="text"
                placeholder={
                  mappedLocale === 'de-DE'
                    ? 'Rezept suchen...'
                    : 'Search recipes...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.menuGrid}>
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
                <RecipeCard key={item.id} recipe={item} />
              ))
            ) : (
              <p className={styles.noResults}>
                {mappedLocale === 'de-DE'
                  ? 'Keine Rezepte gefunden.'
                  : 'No recipes found.'}
              </p>
            )}
          </div>

          <div className={styles.pagination}>
            {currentPage > 1 && (
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className={styles.pageButton}
              >
                &laquo;
              </button>
            )}
            {Array.from({ length: computedTotalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={
                  currentPage === index + 1
                    ? styles.activePageButton
                    : styles.pageButton
                }
              >
                {index + 1}
              </button>
            ))}
            {currentPage < computedTotalPages && (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className={styles.pageButton}
              >
                &raquo;
              </button>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
