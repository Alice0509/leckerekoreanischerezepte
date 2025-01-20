import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from '../../styles/Home.module.css';
import { useRouter } from 'next/router';
import RecipeCard from '../../components/RecipeCard';

// 로케일 및 페이지별 캐시 변수를 제거
// const pageCache = {};

// ... getStaticPaths 및 getStaticProps 부분은 그대로 유지 ...

const PaginatedPage = ({ recipes = [], currentPage, totalPages, error }) => {
  // recipes에 기본값 []를 지정하여 undefined 방지
  const [displayItems, setDisplayItems] = useState(recipes);
  const itemsPerPage = 20;
  const router = useRouter();
  const { locale } = router;
  const mappedLocale = locale === 'de' ? 'de-DE' : 'en-US';

  // 검색 및 필터링 기능 제거에 따라 단순화
  const safeRecipes = recipes || []; // recipes가 undefined일 경우 대비
  const filteredItems = safeRecipes;
  const searchedItems = filteredItems;

  const [hasMore, setHasMore] = useState(currentPage < totalPages);
  const [page, setPage] = useState(currentPage);

  const fetchMoreData = async () => {
    const nextPage = page + 1;
    if (nextPage > totalPages) {
      setHasMore(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/recipes?page=${nextPage}&limit=${itemsPerPage}&locale=${mappedLocale}`
      );
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

  useEffect(() => {
    setDisplayItems(searchedItems.slice(0, itemsPerPage));
    setPage(1);
    setHasMore(1 < totalPages);
  }, [searchedItems, itemsPerPage, totalPages]);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>{mappedLocale === 'de-DE' ? 'Rezeptliste' : 'Recipe List'}</h1>
      <div className={styles.controlsContainer}>
        {/* 현재 검색 및 카테고리 필터링 UI 제거 */}
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

export default PaginatedPage;
