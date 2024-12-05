import React, { useState, useEffect } from 'react';
import client from '../lib/contentful';
import styles from '../styles/Home.module.css';
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/router';
import RecipeCard from '../components/RecipeCard';

export async function getStaticProps({ locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en';
    const itemsPerPage = 12;

    const res = await client.getEntries({
      content_type: 'recipe',
      locale: mappedLocale,
      include: 1,
      select:
        'fields.slug,fields.titel,fields.category,fields.image,fields.youTubeUrl,fields.description',
      limit: itemsPerPage,
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

      return {
        id: item.sys.id,
        slug: item.fields.slug,
        titel: item.fields.titel,
        category: item.fields.category,
        youTubeUrl: item.fields.youTubeUrl || null,
        image: imageUrl || '/images/default.png',
        descriptionText,
      };
    });

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
        totalPages,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching recipes for page:', error);
    return {
      props: {
        recipes: [],
        totalPages: 1,
        error: 'Failed to fetch recipes.',
      },
      revalidate: 60,
    };
  }
}

const Home = ({ recipes, totalPages, error }) => {
  const [displayItems, setDisplayItems] = useState(recipes);
  const itemsPerPage = 12;
  const router = useRouter();
  const { locale, query } = router;
  const mappedLocale = locale === 'de' ? 'de-DE' : 'en-US';
  const currentPage = parseInt(query.page) || 1;

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch(
          `/api/recipes?page=${currentPage}&limit=${itemsPerPage}&locale=${mappedLocale}`
        );
        const data = await res.json();
        if (data.recipes) {
          setDisplayItems(data.recipes);
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    if (currentPage > 1) {
      fetchRecipes();
    } else {
      setDisplayItems(recipes);
    }
  }, [currentPage, mappedLocale, recipes]);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const handlePageChange = (pageNumber) => {
    router.push(`/?page=${pageNumber}`, undefined, { shallow: true });
  };

  return (
    <div className={styles.container}>
      <h1>{mappedLocale === 'de-DE' ? 'Rezeptliste' : 'Recipe List'}</h1>

      <div className={styles.controlsContainer}>
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
              console.log(e.target.value); // Removed unused state
            }}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.menuGrid}>
        {displayItems.length > 0 ? (
          displayItems.map((item) => <RecipeCard key={item.id} recipe={item} />)
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
        {Array.from({ length: totalPages }, (_, index) => (
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
        {currentPage < totalPages && (
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
