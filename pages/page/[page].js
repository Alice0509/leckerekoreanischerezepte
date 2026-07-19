import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from '../../styles/Home.module.css';
import { useRouter } from 'next/router';
import RecipeCard from '../../components/RecipeCard';
import client from '../../lib/contentful';
import { getRecipeCategoryFromFields } from '../../lib/recipeCategories';

const ITEMS_PER_PAGE = 20;

const normalizeLocale = (locale) => {
  if (locale === 'de' || locale === 'de-DE') return 'de';
  return 'en';
};

const getCardImageUrl = (imageField) => {
  if (!imageField) return '/images/default.png';

  const image = Array.isArray(imageField) ? imageField[0] : imageField;
  const url = image?.fields?.file?.url;

  return url ? `https:${url}` : '/images/default.png';
};

const mapRecipeForCard = (item, locale) => {
  const categoryData = getRecipeCategoryFromFields(item.fields, locale);

  return {
    id: item.sys.id,
    slug: item.fields.slug || null,
    titel: item.fields.titel || '',
    title: item.fields.titel || '',
    category: categoryData.label,
    categoryKey: categoryData.key,
    youTubeUrl: item.fields.youTubeUrl || null,
    image: getCardImageUrl(item.fields.image),
  };
};

const PaginatedPage = ({
  recipes = [],
  currentPage = 1,
  totalPages = 1,
  error = null,
}) => {
  const router = useRouter();
  const { locale } = router;

  const mappedLocale = locale === 'de' ? 'de-DE' : 'en-US';

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
      const res = await fetch(
        `/api/recipes?page=${nextPage}&limit=${ITEMS_PER_PAGE}&locale=${mappedLocale}`
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch recipes: ${res.status}`);
      }

      const data = await res.json();

      if (data.recipes && data.recipes.length > 0) {
        setDisplayItems((prev) => [...prev, ...data.recipes]);
        setPage(nextPage);
        router.push(`/page/${nextPage}`, undefined, { shallow: true });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching more recipes:', error);
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
  try {
    const paths = [];

    for (const locale of locales || ['en', 'de']) {
      const contentfulLocale = normalizeLocale(locale);

      const res = await client.getEntries({
        content_type: 'recipe',
        locale: contentfulLocale,
        select: 'sys.id',
        limit: 1,
      });

      const totalPages = Math.max(
        Math.ceil((res.total || 0) / ITEMS_PER_PAGE),
        1
      );

      for (let page = 1; page <= totalPages; page += 1) {
        paths.push({
          params: { page: String(page) },
          locale,
        });
      }
    }

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error generating paginated paths:', error);

    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params, locale }) {
  const currentPage = Math.max(parseInt(params?.page, 10) || 1, 1);
  const contentfulLocale = normalizeLocale(locale);

  try {
    const res = await client.getEntries({
      content_type: 'recipe',
      locale: contentfulLocale,
      include: 2,
      select:
        'fields.slug,fields.titel,fields.category,fields.categories,fields.image,fields.youTubeUrl',
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
      order: '-sys.createdAt',
    });

    const recipes = res.items.map((item) =>
      mapRecipeForCard(item, contentfulLocale)
    );
    const totalPages = Math.max(
      Math.ceil((res.total || 0) / ITEMS_PER_PAGE),
      1
    );

    if (currentPage > totalPages) {
      return {
        notFound: true,
        revalidate: 60 * 60 * 12,
      };
    }

    return {
      props: {
        recipes,
        currentPage,
        totalPages,
      },
      revalidate: 60 * 60 * 12,
    };
  } catch (error) {
    console.error('Error fetching paginated recipes:', error);

    return {
      props: {
        recipes: [],
        currentPage,
        totalPages: 1,
        error:
          contentfulLocale === 'de'
            ? 'Rezepte konnten nicht geladen werden.'
            : 'Recipes could not be loaded.',
      },
      revalidate: 60 * 60 * 12,
    };
  }
}

export default PaginatedPage;
