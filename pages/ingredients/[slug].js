// pages/ingredients/[slug].js
import React from 'react';
import client from '../../lib/contentful';
import Image from 'next/image';
import styles from '../../styles/IngredientDetail.module.css';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

const loadingSpinner =
  'data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAACH5BAEAAAEALAAAAAAQABAAAAIgjI+py+0Po5y02ouzPgUAOw==';

export async function getStaticPaths() {
  const res = await client.getEntries({
    content_type: 'ingredient',
    select: 'fields.slug',
    include: 0,
  });

  const paths = res.items.map((item) => ({
    params: { slug: item.fields.slug },
  }));

  return {
    paths,
    fallback: false, // 존재하지 않는 경로는 404 페이지로 이동
  };
}

export async function getStaticProps({ params, locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en';

    const res = await client.getEntries({
      content_type: 'ingredient',
      'fields.slug': params.slug,
      locale: mappedLocale,
      include: 1,
    });

    if (!res.items.length) {
      return {
        notFound: true,
      };
    }

    const item = res.items[0];
    const imageAsset = item.fields.bild ? item.fields.bild : null;
    const imageUrl = imageAsset ? `https:${imageAsset.fields.file.url}` : null;

    const ingredient = {
      id: item.sys.id,
      name: item.fields.name,
      slug: item.fields.slug,
      germanMeatCut: item.fields.germanMeatCut || null,
      bild: imageUrl,
      description: item.fields.description || null,
    };

    console.log('Fetched Ingredient Detail:', ingredient);

    return {
      props: {
        ingredient,
        mappedLocale,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return {
      props: {
        ingredient: null,
        error: 'Failed to fetch ingredient.',
      },
      revalidate: 60,
    };
  }
}

const IngredientDetail = ({ ingredient, error, mappedLocale }) => {
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!ingredient) {
    return (
      <div className={styles.noIngredient}>
        {mappedLocale === 'de'
          ? 'Zutat nicht gefunden.'
          : 'Ingredient not found.'}
      </div>
    );
  }

  const { name, germanMeatCut, bild, description } = ingredient;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{name}</h1>
      {bild && (
        <div className={styles.imageWrapper}>
          <Image
            src={bild}
            alt={`${name} 이미지`}
            width={600}
            height={400}
            className={styles.image}
            placeholder="blur"
            blurDataURL={loadingSpinner}
          />
        </div>
      )}
      {germanMeatCut && <p className={styles.meatCut}>부위: {germanMeatCut}</p>}
      <div className={styles.description}>
        {description
          ? documentToReactComponents(description)
          : '설명이 없습니다.'}
      </div>
    </div>
  );
};

export default IngredientDetail;
