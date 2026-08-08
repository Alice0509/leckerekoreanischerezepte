import React, { useEffect, useState } from 'react';
import fs from 'node:fs/promises';
import path from 'node:path';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from '../../styles/Home.module.css';
import { useRouter } from 'next/router';
import RecipeCard from '../../components/RecipeCard';

const normalizeLocale = (locale) => (locale === 'de' ? 'de' : 'en');

const getRecipeDataPath = (locale, filename) =>
  path.join(
    process.cwd(),
    'public',
    'data',
    'recipes',
    normalizeLocale(locale),
    filename
  );

const readRecipeDataFile = async (locale, filename) => {
  const filePath = getRecipeDataPath(locale, filename);
  const content = await fs.readFile(filePath, 'utf8');

  return JSON.parse(content);
};

const PaginatedPage = ({
  recipes = [],
  currentPage = 1,
  totalPages = 1,
  error = null,
}) => {
  const router = useRouter();
  const { locale } = router;

  const dataLocale = normalizeLocale(locale);
  const mappedLocale = dataLocale === 'de' ? 'de-DE' : 'en-US';

  const [displayItems, setDisplayItems] = useState(recipes || []);
  const [hasMore, setHasMore] = useState(currentPage < totalPages);
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    setDisplayItems(recipes || []);
    setPage(currentPage);
    setHasMore(currentPage < totalPages);
  }, [recipes, currentPage, totalPages]);

  const fetchMoreData = async () => {
    const nextPage = page + 1;

    if (nextPage > totalPages) {
      setHasMore(false);
      return;
    }

    try {
      const response = await fetch(
        `/data/recipes/${dataLocale}/page-${nextPage}.json`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch static recipe data: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.recipes && data.recipes.length > 0) {
        setDisplayItems((previous) => [...previous, ...data.recipes]);
        setPage(nextPage);

        router.push(`/page/${nextPage}`, undefined, {
          shallow: true,
        });
      } else {
        setHasMore(false);
      }
    } catch (fetchError) {
      console.error('Error fetching more recipes:', fetchError);
      setHasMore(false);
    }
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>{mappedLocale === 'de-DE' ? 'Rezeptliste' : 'Recipe List'}</h1>

      <div className={styles.controlsContainer}>
        {/* 검색 및 카테고리 필터링 UI는 현재 제거됨 */}
      </div>

      <InfiniteScroll
        dataLength={displayItems.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4>{mappedLocale === 'de-DE' ? 'Laden...' : 'Loading...'}</h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>
              {mappedLocale === 'de-DE'
                ? 'Keine weiteren Rezepte.'
                : 'No more recipes.'}
            </b>
          </p>
        }
      >
        <div className={styles.menuGrid}>
          {displayItems.length > 0 ? (
            displayItems.map((item) => (
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
      </InfiniteScroll>
    </div>
  );
};

export async function getStaticPaths({ locales }) {
  const paths = [];

  for (const locale of locales || ['en', 'de']) {
    try {
      const manifest = await readRecipeDataFile(locale, 'manifest.json');

      for (let page = 1; page <= manifest.totalPages; page += 1) {
        paths.push({
          params: { page: String(page) },
          locale,
        });
      }
    } catch (error) {
      console.error(
        `Error reading static recipe manifest for ${locale}:`,
        error
      );
    }
  }

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params, locale }) {
  const currentPage = Math.max(parseInt(params?.page, 10) || 1, 1);
  const dataLocale = normalizeLocale(locale);

  try {
    const data = await readRecipeDataFile(
      dataLocale,
      `page-${currentPage}.json`
    );

    if (currentPage > data.totalPages || !Array.isArray(data.recipes)) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        recipes: data.recipes,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      },
    };
  } catch (error) {
    console.error('Error reading static paginated recipe data:', error);

    return {
      notFound: true,
    };
  }
}

export default PaginatedPage;
