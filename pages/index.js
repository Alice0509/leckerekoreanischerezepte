// pages/index.js
import React, { useState, useMemo, useEffect } from 'react';
import client from '../lib/contentful';
import Fuse from 'fuse.js';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from '../styles/Home.module.css';
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/router';
import RecipeCard from '../components/RecipeCard';

export async function getStaticProps({ locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en'; // 로케일 매핑

    const res = await client.getEntries({
      content_type: 'recipe',
      locale: mappedLocale,
      include: 2, // ingredients 링크까지 포함
    });

    const assetsMap = {};


    // Asset 매핑
    res.includes.Asset?.forEach(asset => {
      assetsMap[asset.sys.id] = asset;
    });


    // Recipes 매핑
    const recipes = res.items.map(item => {
      const images = item.fields.image?.map(img => assetsMap[img.sys.id]) || [];


      return {
        id: item.sys.id, // sys.id를 별도의 필드로 추가
        ...item.fields,
        image: images.length > 0 ? images[0] : null
      };
    });

    console.log('Fetched recipes:', recipes);

    return {
      props: {
        recipes,
      },
      revalidate: 1, // ISR 설정
    };
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return {
      props: {
        recipes: [],
        error: 'Failed to fetch recipes.',
      },
      revalidate: 1,
    };
  }
}

const Home = ({ recipes, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8; // 초기 레시피 수
  const router = useRouter();
  const { locale } = router;
  const mappedLocale = locale === 'de' ? 'de-DE' : 'en-US'; // 로케일 매핑

  // Fuse.js 설정
  const fuse = useMemo(
    () =>
      new Fuse(recipes, {
        keys: [
          'titel',
          'description',
          'ingredients.name_de',
          'ingredients.name_en',
        ],
        threshold: 0.3,
      }),
    [recipes]
  );

  // 카테고리 목록 생성
  const categories = useMemo(
    () => [...new Set(recipes.map((item) => item.category).filter(Boolean))],
    [recipes]
  );

  // 카테고리 필터링
  const filteredItems = useMemo(() => {
    return recipes.filter((item) => {
      const matchesCategory = selectedCategory
        ? item.category === selectedCategory
        : true;
      return matchesCategory;
    });
  }, [recipes, selectedCategory]);

  // 검색 필터링
  const searchedItems = useMemo(() => {
    return searchTerm
      ? fuse.search(searchTerm).map((result) => result.item)
      : filteredItems;
  }, [searchTerm, fuse, filteredItems]);

  // 무한 스크롤을 위한 아이템 로드
  const [displayItems, setDisplayItems] = useState(searchedItems.slice(0, itemsPerPage));

  const fetchMoreData = () => {
    const nextPage = currentPage + 1;
    const newItems = searchedItems.slice(0, nextPage * itemsPerPage);
    setDisplayItems(newItems);
    setCurrentPage(nextPage);
  };

  // 검색 또는 카테고리 변경 시 아이템 리셋
  useEffect(() => {
    setDisplayItems(searchedItems.slice(0, itemsPerPage));
    setCurrentPage(0);
  }, [searchedItems]);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>{mappedLocale === 'de-DE' ? 'Rezeptliste' : 'Recipe List'}</h1>

      <div className={styles.controlsContainer}>
  {/* 카테고리 필터 */}
  <div className={styles.filterContainer}>
    <label htmlFor="categorySelect">
      {mappedLocale === 'de-DE' ? 'Kategorie:' : 'Category:'}
    </label>
    <select
      id="categorySelect"
      value={selectedCategory}
      onChange={(e) => {
        setSelectedCategory(e.target.value);
      }}
      className={styles.categorySelect}
    >
      <option value="">
        {mappedLocale === 'de-DE' ? 'Alle' : 'All'}
      </option>
      {categories.map((category, index) => (
        <option key={index} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>

  {/* 검색 바 */}
  <div className={styles.searchContainer}>
    <FaSearch className={styles.icon} />
    <input
      type="text"
      placeholder={
        mappedLocale === 'de-DE' ? 'Rezept suchen...' : 'Search recipes...'
      }
      onChange={(e) => {
        setSearchTerm(e.target.value);
      }}
      className={styles.searchInput}
    />
  </div>
</div>


      {/* 레시피 그리드 - 무한 스크롤 */}
      <InfiniteScroll
        dataLength={displayItems.length}
        next={fetchMoreData}
        hasMore={displayItems.length < searchedItems.length}
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

export default Home;
