// pages/index.js
import React, { useState, useMemo, useEffect } from 'react';
import client from '../lib/contentful';
import Fuse from 'fuse.js';
import styles from '../styles/Home.module.css';
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import RecipeCard from '../components/RecipeCard';
import Head from 'next/head';

// 로케일별 데이터 캐시
const recipesCache = {};
const favoritesCache = {};

const RECIPE_CATEGORY_LABELS = {
  soups: {
    de: 'Eintöpfe & Suppen',
    en: 'Stews & soups',
  },
  riceNoodles: {
    de: 'Reis & Nudeln',
    en: 'Rice & noodles',
  },
  sideDishes: {
    de: 'Beilagen',
    en: 'Side dishes',
  },
  mainDishes: {
    de: 'Hauptgerichte',
    en: 'Main dishes',
  },
  streetFood: {
    de: 'Street Food',
    en: 'Street food',
  },
  saucesBasics: {
    de: 'Saucen & Basics',
    en: 'Sauces & basics',
  },
  sweetsBaking: {
    de: 'Süßes & Gebäck',
    en: 'Sweets & baking',
  },
};

const RECIPE_CATEGORY_ORDER = [
  'soups',
  'riceNoodles',
  'sideDishes',
  'mainDishes',
  'streetFood',
  'saucesBasics',
  'sweetsBaking',
];

const getRecipeCategoryLocale = (locale) => (locale === 'de' ? 'de' : 'en');

const getRecipeCategoryLabel = (categoryKey, locale) => {
  const language = getRecipeCategoryLocale(locale);
  return (
    RECIPE_CATEGORY_LABELS[categoryKey]?.[language] ||
    RECIPE_CATEGORY_LABELS.mainDishes[language]
  );
};

const hasAnyRecipeKeyword = (value, keywords) => {
  const haystack = `${value || ''}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
};

const getRecipeCategoryKey = ({ title, slug, category }) => {
  const value = `${title || ''} ${slug || ''} ${category || ''}`;

  if (
    hasAnyRecipeKeyword(value, [
      'jjigae',
      'guk',
      'soup',
      'stew',
      'miyeokguk',
      'yukgaejang',
      'kimchi-udon',
      'mandu-guk',
      'tteokguk',
      '잔치국수',
      '국',
      '찌개',
      '육개장',
      '미역국',
    ])
  ) {
    return 'soups';
  }

  if (
    hasAnyRecipeKeyword(value, [
      'rice',
      'fried-rice',
      'bibimbap',
      'kimbap',
      'gimbap',
      'japchae',
      'noodle',
      'noodles',
      'guksu',
      'udon',
      'pasta',
      'bap',
      '밥',
      '김밥',
      '잡채',
      '국수',
      '우동',
      '파스타',
    ])
  ) {
    return 'riceNoodles';
  }

  if (
    hasAnyRecipeKeyword(value, [
      'namul',
      'muchim',
      'jorim',
      'jangjorim',
      'eomuk',
      'eggplant',
      'spinach',
      'kongnamul',
      'sukju',
      'gyeranjjim',
      'side dish',
      '나물',
      '무침',
      '조림',
      '계란찜',
      '어묵',
      '가지',
      '콩나물',
      '숙주',
      '시금치',
    ])
  ) {
    return 'sideDishes';
  }

  if (
    hasAnyRecipeKeyword(value, [
      'sauce',
      'ssamjang',
      'chogochujang',
      'dressing',
      'jjajang-sauce',
      'tonkatsu-sauce',
      'marinade',
      '초고추장',
      '쌈장',
      '소스',
      '드레싱',
      '짜장',
    ])
  ) {
    return 'saucesBasics';
  }

  if (
    hasAnyRecipeKeyword(value, [
      'hotteok',
      'waffle',
      'pecan',
      'pie',
      'soboro',
      'cookie',
      'danpatbbang',
      'bread',
      'cake',
      'sweet',
      '호떡',
      '와플',
      '파이',
      '쿠키',
      '빵',
      '단팥빵',
    ])
  ) {
    return 'sweetsBaking';
  }

  if (
    hasAnyRecipeKeyword(value, [
      'tteokbokki',
      'toast',
      'street',
      'snack',
      'boiled-potatoes',
      'jeon',
      'pancake',
      '떡볶이',
      '토스트',
      '감자',
      '전',
      '김치전',
    ])
  ) {
    return 'streetFood';
  }

  if (
    hasAnyRecipeKeyword(value, [
      'bulgogi',
      'pork',
      'ribs',
      'squid',
      'chicken',
      'tonkatsu',
      'jicoba',
      'beef',
      'main',
      '불고기',
      '돼지갈비',
      '오징어',
      '치킨',
      '돈가스',
      '고기',
    ])
  ) {
    return 'mainDishes';
  }

  return 'mainDishes';
};

export async function getStaticProps({ locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en';

    if (recipesCache[mappedLocale] && favoritesCache[mappedLocale]) {
      return {
        props: {
          recipes: recipesCache[mappedLocale],
          favorites: favoritesCache[mappedLocale],
        },
        revalidate: 60 * 60 * 12,
      };
    }

    const [recipeRes, favoriteRes] = await Promise.all([
      client.getEntries({
        content_type: 'recipe',
        locale: mappedLocale,
        include: 1,
        select:
          'fields.slug,fields.titel,fields.category,fields.image,fields.youTubeUrl,fields.description',
        limit: 1000,
      }),
      client.getEntries({
        content_type: 'favoriteItem',
        locale: mappedLocale,
        include: 1,
        limit: 3,
      }),
    ]);

    const assetsMap = {};
    recipeRes.includes.Asset?.forEach((asset) => {
      assetsMap[asset.sys.id] = asset;
    });

    const recipes = recipeRes.items.map((item) => {
      let imageUrl = null;

      if (item.fields.image) {
        if (Array.isArray(item.fields.image)) {
          const firstImage = item.fields.image[0];
          if (firstImage?.sys?.id) {
            const imageAsset = assetsMap[firstImage.sys.id];
            if (imageAsset?.fields?.file?.url) {
              imageUrl = `https:${imageAsset.fields.file.url}`;
            }
          }
        } else if (item.fields.image.sys?.id) {
          const imageAsset = assetsMap[item.fields.image.sys.id];
          if (imageAsset?.fields?.file?.url) {
            imageUrl = `https:${imageAsset.fields.file.url}`;
          }
        }
      }

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

      let category = 'Uncategorized';
      if (item.fields.category) {
        if (Array.isArray(item.fields.category)) {
          category = item.fields.category.map((c) => c.fields.name).join(', ');
        } else if (typeof item.fields.category === 'object') {
          category = item.fields.category.fields.name || 'Uncategorized';
        } else {
          category = item.fields.category;
        }
      }

      const categoryKey = getRecipeCategoryKey({
        title: item.fields.titel,
        slug: item.fields.slug,
        category,
      });

      const displayCategory = getRecipeCategoryLabel(categoryKey, locale);

      return {
        id: item.sys.id,
        slug: item.fields.slug,
        titel: item.fields.titel,
        category: displayCategory,
        categoryKey,
        originalCategory: category,
        youTubeUrl: item.fields.youTubeUrl || null,
        image: imageUrl || '/images/default.png',
        descriptionText,
      };
    });

    const favorites = favoriteRes.items.map((item) => {
      const imageUrl = item.fields.image?.fields?.file?.url
        ? `https:${item.fields.image.fields.file.url}`
        : null;

      const memo = item.fields.memo || '';
      const shortMemo = memo.length > 90 ? `${memo.substring(0, 90)}…` : memo;

      return {
        id: item.sys.id,
        title: item.fields.title || '',
        memo: shortMemo,
        image: imageUrl,
      };
    });

    recipesCache[mappedLocale] = recipes;
    favoritesCache[mappedLocale] = favorites;

    return {
      props: {
        recipes,
        favorites,
      },
      revalidate: 60 * 60 * 12,
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      props: {
        recipes: [],
        favorites: [],
        error: 'Failed to fetch homepage data.',
      },
      revalidate: 60 * 60 * 12,
    };
  }
}

const Home = ({ recipes, favorites, error }) => {
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
          title:
            'Korean recipes with ingredients you can find in Germany | Leckere Koreanische Rezepte',
          description:
            'Easy Korean home cooking with ingredients you can find in Germany: practical recipes, ingredient tips, and warm family meals.',
        };

  const startHereCards =
    mappedLocale === 'de-DE'
      ? [
          {
            title: 'Koreanisch kochen in Deutschland',
            text: 'Starte mit einfachen Gerichten und Zutaten, die du wirklich finden kannst.',
            href: '#all-recipes',
          },
          {
            title: 'Zutaten verstehen',
            text: 'Gochujang, Gochugaru, Reis, Kimchi und mehr – mit Alltagstipps für Deutschland.',
            href: '/ingredients',
          },
          {
            title: 'Ehrliche Favoriten',
            text: 'Produkte und Küchenbasics, die ich selbst im Alltag benutze.',
            href: '/gallery',
          },
        ]
      : [
          {
            title: 'Cook Korean food in Germany',
            text: 'Start with simple dishes and ingredients you can actually find.',
            href: '#all-recipes',
          },
          {
            title: 'Understand Korean ingredients',
            text: 'Gochujang, gochugaru, rice, kimchi, and more — with practical Germany-based tips.',
            href: '/ingredients',
          },
          {
            title: 'Honest favorites',
            text: 'Products and kitchen basics I actually use in daily life.',
            href: '/gallery',
          },
        ];

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
        <meta property="og:title" content={seoCopy.title} />
        <meta property="og:description" content={seoCopy.description} />
      </Head>

      <div className={styles.container}>
        {/* HERO */}
        <section className={styles.heroSection}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>
              {mappedLocale === 'de-DE'
                ? 'Koreanisch kochen in Deutschland'
                : 'Korean cooking in Germany'}
            </p>

            <h1 className={styles.heroTitle}>
              {mappedLocale === 'de-DE'
                ? 'Koreanische Hausmannskost mit Zutaten, die du in Deutschland findest'
                : 'Korean home cooking with ingredients you can find in Germany'}
            </h1>

            <p className={styles.heroDescription}>
              {mappedLocale === 'de-DE'
                ? 'Einfache koreanische Rezepte, ehrliche Zutaten-Tipps und warme Familiengerichte – gekocht in Deutschland, mit koreanischem Herzen.'
                : 'Easy Korean recipes, honest ingredient tips, and warm family meals — cooked in Germany with a Korean heart.'}
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

        {/* START HERE */}
        <section
          className={styles.startHereSection}
          aria-labelledby="start-here-title"
        >
          <div className={styles.previewHeader}>
            <h2 id="start-here-title" className={styles.previewTitle}>
              {mappedLocale === 'de-DE' ? 'Hier anfangen' : 'Start here'}
            </h2>
          </div>

          <div className={styles.startHereGrid}>
            {startHereCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={styles.startHereCard}
              >
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAVORITES PREVIEW */}
        {favorites.length > 0 && (
          <section className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <h2 className={styles.previewTitle}>
                {mappedLocale === 'de-DE'
                  ? 'Koreanische Zutaten in Deutschland'
                  : 'Korean ingredients in Germany'}
              </h2>
              <Link href="/gallery" className={styles.previewLink}>
                {mappedLocale === 'de-DE' ? 'Alle ansehen' : 'View all'}
              </Link>
            </div>

            <p className={styles.previewNotice}>
              {mappedLocale === 'de-DE'
                ? 'Praktische Lieblingszutaten und Küchenbasics aus meinem Alltag – besonders hilfreich, wenn du koreanisch kochen möchtest und in Deutschland einkaufst.'
                : 'Practical favorite ingredients and kitchen basics from my daily life — especially useful when you cook Korean food and shop in Germany.'}
            </p>

            <div className={styles.favoritesPreviewGrid}>
              {favorites.map((item, index) => {
                const colorClass =
                  index % 3 === 0
                    ? styles.memoYellow
                    : index % 3 === 1
                      ? styles.memoPink
                      : styles.memoBlue;

                return (
                  <article
                    key={item.id}
                    className={`${styles.favoritePreviewCard} ${colorClass}`}
                  >
                    {item.image && (
                      <div className={styles.favoritePreviewImageWrap}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className={styles.favoritePreviewImage}
                        />
                      </div>
                    )}

                    <div className={styles.favoritePreviewContent}>
                      <h3>{item.title}</h3>
                      <p>{item.memo}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

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
