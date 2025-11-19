// pages/index.js
import React, { useState, useMemo, useEffect } from 'react';
import client from '../lib/contentful';
import Fuse from 'fuse.js';
import styles from '../styles/Home.module.css';
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/router';
import RecipeCard from '../components/RecipeCard';

// 로케일별 레시피 데이터를 저장할 메모리 캐시 객체
const recipesCache = {};

export async function getStaticProps({ locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en';

    // 캐시에 데이터가 있으면 API 호출 없이 반환
    if (recipesCache[mappedLocale]) {
      return {
        props: {
          recipes: recipesCache[mappedLocale],
        },
        revalidate: 60, // ISR 설정: 60초 후 재생성
      };
    }

    // 캐시에 데이터가 없을 경우 Contentful API 호출
    const res = await client.getEntries({
      content_type: 'recipe',
      locale: mappedLocale,
      include: 1,
      select:
        'fields.slug,fields.titel,fields.category,fields.image,fields.youTubeUrl,fields.description',
      limit: 1000,
    });

    const assetsMap = {};
    res.includes.Asset?.forEach((asset) => {
      assetsMap[asset.sys.id] = asset;
    });

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

      return {
        id: item.sys.id,
        slug: item.fields.slug,
        titel: item.fields.titel,
        category,
        youTubeUrl: item.fields.youTubeUrl || null,
        image: imageUrl || '/images/default.png',
        descriptionText,
      };
    });

    // 가져온 레시피 데이터를 캐시에 저장
    recipesCache[mappedLocale] = recipes;

    return {
      props: {
        recipes,
      },
      revalidate: 60, // ISR 설정: 60초 후 재생성
    };
  } catch (error) {
    console.error('Error fetching recipes for page:', error);
    return {
      props: {
        recipes: [],
        error: 'Failed to fetch recipes.',
      },
      revalidate: 60,
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

  // Fuse.js 설정
  const fuse = useMemo(
    () =>
      new Fuse(recipes, {
        keys: ['titel', 'descriptionText'],
        threshold: 0.3,
      }),
    [recipes]
  );

  // 카테고리 목록 생성
  const categories = useMemo(() => {
    return [
      ...new Set(
        recipes
          .map((item) => item.category)
          .flatMap((category) => category.split(', '))
          .filter(Boolean)
      ),
    ];
  }, [recipes]);

  // 카테고리 필터링
  const filteredItems = useMemo(() => {
    return recipes.filter((item) => {
      const matchesCategory = selectedCategory
        ? item.category.split(', ').includes(selectedCategory)
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

  // 현재 페이지에 해당하는 아이템 계산
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return searchedItems.slice(start, end);
  }, [searchedItems, currentPage, itemsPerPage]);

  // 총 페이지 수 계산
  const computedTotalPages = useMemo(() => {
    return Math.ceil(searchedItems.length / itemsPerPage);
  }, [searchedItems, itemsPerPage]);

  // 검색 또는 카테고리 변경 시 페이지 리셋
  useEffect(() => {
    if (currentPage !== 1) {
      handlePageChange(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory]);

  useEffect(() => {}, [
    recipes,
    categories,
    filteredItems,
    searchedItems,
    paginatedItems,
  ]);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const handlePageChange = (pageNumber) => {
    router.push(`/?page=${pageNumber}`, undefined, { shallow: true });
  };

  return (
    <div className={styles.container}>
      <div className={styles.controlsContainer}>
        {/* 카테고리 필터 */}
        <div className={styles.filterContainer}>
          <select
            id="categorySelect"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
            }}
            className={styles.categorySelect}
          >
            <option value="">
              {mappedLocale === 'de-DE' ? 'Kategorie' : 'Category'}
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

      {/* 페이지네이션 */}
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
    </div>
  );
};

export default Home;
