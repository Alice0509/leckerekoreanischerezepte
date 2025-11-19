// pages/ingredients/index.js
import React from 'react';
import client from '../../lib/contentful';
import IngredientCard from '../../components/IngredientCard';
import styles from '../../styles/Ingredients.module.css';

// 로케일별 재료 목록을 저장할 메모리 캐시 객체
const ingredientsCache = {};

export async function getStaticProps({ locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en';

    // 캐시에 데이터가 있으면 API 호출 없이 반환
    if (ingredientsCache[mappedLocale]) {
      return {
        props: {
          ingredients: ingredientsCache[mappedLocale],
          mappedLocale,
        },
        revalidate: 60,
      };
    }

    const res = await client.getEntries({
      content_type: 'ingredient',
      locale: mappedLocale,
      include: 1,
    });

    console.log('Contentful API Response:', JSON.stringify(res, null, 2));

    if (!res.items) {
      console.warn(
        'No items found for content_type: ingredient, locale:',
        mappedLocale
      );
    }

    const assetsMap = {};
    res.includes.Asset?.forEach((asset) => {
      assetsMap[asset.sys.id] = asset;
    });

    const ingredients = res.items
      .map((item) => {
        const imageAsset = item.fields.bild?.sys?.id
          ? assetsMap[item.fields.bild.sys.id]
          : null;
        const imageUrl = imageAsset
          ? `https:${imageAsset.fields.file.url}`
          : null;

        return {
          id: item.sys.id,
          name: item.fields.name,
          slug: item.fields.slug,
          germanMeatCut: item.fields.germanMeatCut || null,
          bild: imageUrl,
          description: item.fields.description || null,
        };
      })
      .filter((ingredient) => ingredient.description);

    console.log('Filtered Ingredients:', ingredients);

    // 캐시에 데이터 저장
    ingredientsCache[mappedLocale] = ingredients;

    return {
      props: {
        ingredients,
        mappedLocale,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return {
      props: {
        ingredients: [],
        error: 'Failed to fetch ingredients.',
      },
      revalidate: 60,
    };
  }
}

const Ingredients = ({ ingredients, error, mappedLocale }) => {
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!ingredients || ingredients.length === 0) {
    return (
      <div className={styles.noIngredients}>
        {mappedLocale === 'de'
          ? 'Keine Zutaten verfügbar.'
          : 'No ingredients available.'}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {ingredients.map((ingredient) => (
          <IngredientCard key={ingredient.id} ingredient={ingredient} />
        ))}
      </div>
    </div>
  );
};

export default Ingredients;
