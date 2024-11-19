// pages/page/[page].js

import React, { useState, useMemo, useEffect } from 'react';
import client from '../../lib/contentful';
import Fuse from 'fuse.js';
import InfiniteScroll from 'react-infinite-scroll-component';
import styles from '../../styles/Home.module.css';
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/router';
import RecipeCard from '../../components/RecipeCard';

export async function getStaticPaths() {
  try {
    const locales = ['de', 'en'];
    let paths = [];

    for (const locale of locales) {
      // 전체 레시피 수를 가져옵니다.
      const totalRes = await client.getEntries({
        content_type: 'recipe',
        locale: locale,
        limit: 0, // 항목 수만 가져오기
      });

      const totalRecipes = totalRes.total;
      const itemsPerPage = 20; // 페이지당 항목 수 (필요에 따라 조정)
      const totalPages = Math.ceil(totalRecipes / itemsPerPage);

      for (let page = 1; page <= totalPages; page++) {
        paths.push({
          params: { page: page.toString() },
          locale: locale,
        });
      }
    }

    return {
      paths,
      fallback: 'blocking', // 필요한 경우 동적으로 페이지 생성
    };
  } catch (error) {
    console.error('Error fetching recipe slugs for static paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params, locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en';
    const pageNumber = parseInt(params.page, 10) || 1;
    const itemsPerPage = 20; // 페이지당 항목 수

    const res = await client.getEntries({
      content_type: 'recipe',
      locale: mappedLocale,
      include: 1, // Linked Asset 포함
      select:
        'fields.slug,fields.titel,fields.category,fields.image,fields.youTubeUrl,fields.description',
      skip: (pageNumber - 1) * itemsPerPage,
      limit: itemsPerPage,
    });

    const assetsMap = {};

    // Asset 매핑
    res.includes.Asset?.forEach((asset) => {
      assetsMap[asset.sys.id] = asset;
    });

    // Recipes 매핑
    const recipes = res.items.map((item) => {
      let imageUrl = null;

      if (item.fields.image) {
        if (Array.isArray(item.fields.image)) {
          const firstImage = item.fields.image[0];
          if (firstImage?.sys?.id) {
            const imageAsset = assetsMap[firstImage.sys.id];
            if (imageAsset && imageAsset.fields.file.url) {
              imageUrl = `https:${imageAsset.fields.file.url}`;
            }
          }
        } else if (item.fields.image.sys?.id) {
          const imageAsset = assetsMap[item.fields.image.sys.id];
          if (imageAsset && imageAsset.fields.file.url) {
            imageUrl = `https:${imageAsset.fields.file.url}`;
          }
        }
      }

      // description을 텍스트로 변환 및 길이 제한
      let descriptionText = '';
      if (item.fields.description && item.fields.description.content) {
        descriptionText = item.fields.description.content
          .map((block) => {
            if (block.nodeType === 'paragraph') {
              return block.content.map((node) => node.value).join('');
            }
            return '';
          })
          .join(' ');
        // 길이 제한 (예: 200자)
        if (descriptionText.length > 200) {
          descriptionText = descriptionText.substring(0, 200) + '...';
        }
      }

      return {
        id: item.sys.id,
        slug: item.fields.slug,
        titel: item.fields.titel,
        category: item.fields.category,
        youTubeUrl: item.fields.youTubeUrl || null,
        image: imageUrl || '/images/default.png', // 기본 이미지 설정
        descriptionText,
      };
    });

    // 총 레시피 수 확인 (페이징 계산을 위해)
    const totalRes = await client.getEntries({
      content_type: 'recipe',
      locale: mappedLocale,
      limit: 0,
    });
    const totalRecipes = totalRes.total;
    const totalPages = Math.ceil(totalRecipes / itemsPerPage);

    return {
      props: {
        recipes,
        currentPage: pageNumber,
        totalPages,
      },
      revalidate: 60, // ISR 설정 (60초 후 페이지 다시 생성)
    };
  } catch (error) {
    console.error('Error fetching recipes for page:', error);
    return {
      props: {
        recipes: [],
        currentPage: 1,
        totalPages: 1,
        error: 'Failed to fetch recipes.',
      },
      revalidate: 60,
    };
  }
}

const PaginatedPage = ({ recipes, currentPage, totalPages, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [displayItems, setDisplayItems] = useState(recipes);
  const itemsPerPage = 20; // 페이지당 항목 수
  const router = useRouter();
  const { locale } = router;
  const mappedLocale = locale === 'de' ? 'de-DE' : 'en-US';

  // Fuse.js 설정
  const fuse = useMemo(
    () =>
      new Fuse(recipes, {
        keys: ['titel', 'descriptionText', 'ingredients.name'],
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

        // URL 업데이트 (shallow routing)
        router.push(`/page/${nextPage}`, undefined, { shallow: true });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching more recipes:', error);
      setHasMore(false);
    }
  };

  // 검색 또는 카테고리 변경 시 아이템 리셋
  useEffect(() => {
    setDisplayItems(searchedItems.slice(0, itemsPerPage));
    setPage(1); // 페이지를 1로 재설정
    setHasMore(1 < totalPages);
  }, [searchedItems, itemsPerPage, totalPages]);

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
              mappedLocale === 'de-DE'
                ? 'Rezept suchen...'
                : 'Search recipes...'
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
