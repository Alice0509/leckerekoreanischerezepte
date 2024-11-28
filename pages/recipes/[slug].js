// pages/recipes/[slug].js

import React from 'react';
import dynamic from 'next/dynamic';
import client from '../../lib/contentful';
import Image from 'next/image';
import styles from '../../styles/RecipeDetail.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { getYouTubeThumbnail } from '../../lib/getYouTubeThumbnail';
import Slider from 'react-slick';

// DisqusComments 컴포넌트를 동적으로 임포트 (SSR 제외)
const DisqusComments = dynamic(
  () => import('../../components/DisqusComments'),
  { ssr: false }
);

export async function getStaticPaths() {
  try {
    const locales = ['de', 'en'];
    let paths = [];

    for (const locale of locales) {
      const res = await client.getEntries({
        content_type: 'recipe',
        select: 'fields.slug',
        locale: locale,
        limit: 1000,
      });

      const localePaths = res.items.map((item) => ({
        params: { slug: item.fields.slug.toLowerCase() }, // 소문자로 변환
        locale: locale,
      }));

      paths = paths.concat(localePaths);
    }

    console.log('Generated paths:', paths); // 로그 추가

    return {
      paths,
      fallback: false, // 또는 'blocking'으로 변경 가능
    };
  } catch (error) {
    console.error('Error fetching recipe slugs:', error);
    return {
      paths: [],
      fallback: false,
    };
  }
}

export async function getStaticProps({ params, locale }) {
  try {
    const { slug } = params;
    const mappedLocale = locale === 'de' ? 'de' : 'en';

    const res = await client.getEntries({
      content_type: 'recipe',
      'fields.slug': slug.toLowerCase(), // 소문자로 변환
      locale: mappedLocale,
      include: 3,
    });

    if (!res.items.length) {
      console.warn(
        `No recipe found for slug: ${params.slug} and locale: ${mappedLocale}`
      );
      return { props: { recipe: null } };
    }

    const recipeEntry = res.items[0];

    // Asset 매핑
    const assetsMap = {};
    res.includes.Asset?.forEach((asset) => {
      assetsMap[asset.sys.id] = asset;
    });

    // recipeIngredient 매핑
    const recipeIngredientEntries =
      res.includes.Entry?.filter(
        (entry) => entry.sys.contentType.sys.id === 'recipeIngredient'
      ) || [];

    // ingredient 엔트리 매핑 (entry 전체로 매핑)
    const ingredientEntries =
      res.includes.Entry?.filter(
        (entry) => entry.sys.contentType.sys.id === 'ingredient'
      ) || [];
    const ingredientMap = {};
    ingredientEntries.forEach((entry) => {
      ingredientMap[entry.sys.id] = entry.fields.name; // 재료 이름만 매핑
    });

    console.log('Recipe Entry Ingredients:', recipeEntry.fields.ingredients);
    console.log('Recipe Ingredients Entries:', recipeIngredientEntries);
    console.log('Ingredient Entries:', ingredientEntries);

    // Ingredients 데이터 구성
    const ingredients =
      recipeEntry.fields.ingredients
        ?.map((ri) => {
          const recipeIngredient = recipeIngredientEntries.find(
            (entry) => entry.sys.id === ri.sys.id
          );
          if (!recipeIngredient) {
            console.warn(`Missing recipeIngredient entry for ID: ${ri.sys.id}`);
            return null; // 오류 방지: recipeIngredient가 없을 경우 null 반환
          }

          const ingredientRef = recipeIngredient.fields.ingredient;
          const ingredientName = ingredientRef?.sys?.id
            ? ingredientMap[ingredientRef.sys.id]
            : 'Unknown Ingredient';

          return {
            id: recipeIngredient.sys.id,
            name: ingredientName,
            quantity: recipeIngredient.fields.quantity || '',
          };
        })
        .filter(Boolean) || []; // null 요소 제거

    // Recipe 이미지 매핑
    const images =
      recipeEntry.fields.image?.map(
        (img) => `https:${assetsMap[img.sys.id].fields.file.url}`
      ) || [];

    const finalRecipe = {
      id: recipeEntry.sys.id,
      titel: recipeEntry.fields.titel,
      description: recipeEntry.fields.description,
      images, // 모든 이미지를 배열로 할당
      category: recipeEntry.fields.category,
      preparationTime: recipeEntry.fields.preparationTime || null,
      servings: recipeEntry.fields.servings || null,
      ingredients,
      instructions: recipeEntry.fields.instructions,
      videoFile: recipeEntry.fields.videoFile || null,
      youTubeUrl: recipeEntry.fields.youTubeUrl || null,
      slug: recipeEntry.fields.slug.toLowerCase(), // 소문자로 변환
      title: recipeEntry.fields.titel,
      locale: mappedLocale,
    };

    console.log('Fetched recipe:', finalRecipe);

    return {
      props: {
        recipe: finalRecipe,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return {
      props: {
        recipe: null,
        error: 'Failed to fetch recipe.',
      },
      revalidate: 60,
    };
  }
}

const RecipeDetail = ({ recipe, error }) => {
  const router = useRouter();
  const { locale } = router;
  const mappedLocale = locale === 'de' ? 'de' : 'en';

  console.log('Rendering RecipeDetail:', recipe);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!recipe) {
    return (
      <div className={styles.error}>
        {mappedLocale === 'de' ? 'Rezept nicht gefunden.' : 'Recipe not found.'}
      </div>
    );
  }

  const {
    titel,
    description,
    images,
    category,
    preparationTime,
    servings,
    ingredients,
    instructions,
    videoFile,
    youTubeUrl,
  } = recipe;

  // 이미지 URL 설정: 이미지가 있으면 첫 번째 이미지 사용, 없으면 YouTube 썸네일, 둘 다 없으면 기본 이미지
  const thumbnailUrl =
    images.length > 0
      ? images[0]
      : youTubeUrl
        ? getYouTubeThumbnail(youTubeUrl)
        : '/images/default.png';

  console.log(`Recipe: ${titel}, Thumbnail URL: ${thumbnailUrl}`);

  // react-slick 캐러셀 설정
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <div className={styles.container}>
      <h1>{titel}</h1>

      {/* 이미지 캐러셀 */}
      {images.length > 0 || youTubeUrl ? (
        <div className={styles.imageWrapper}>
          <Slider {...sliderSettings}>
            {images.map((imgUrl, index) => (
              <div key={index} className={styles.slide}>
                <Image
                  src={imgUrl}
                  alt={`${titel} 이미지 ${index + 1}`}
                  width={600}
                  height={400}
                  className={styles.image}
                  placeholder="blur"
                  blurDataURL="/images/default.png"
                />
              </div>
            ))}
            {!images.length && youTubeUrl && (
              <div className={styles.slide}>
                <Image
                  src={getYouTubeThumbnail(youTubeUrl)}
                  alt={`${titel} YouTube 썸네일`}
                  width={600}
                  height={400}
                  className={styles.image}
                  placeholder="blur"
                  blurDataURL="/images/default.png"
                />
              </div>
            )}
          </Slider>
        </div>
      ) : (
        <div className={styles.imageWrapper}>
          <Image
            src="/images/default.png"
            alt="Default Image"
            width={600}
            height={400}
            className={styles.image}
            placeholder="blur"
            blurDataURL="/images/default.png"
          />
        </div>
      )}

      <div className={styles.description}>
        {documentToReactComponents(description)}
      </div>
      <h2>
        {mappedLocale === 'de' ? 'Kategorie' : 'Category'}: {category}
      </h2>
      <div className={styles.details}>
        {preparationTime && (
          <span className={styles.detail}>
            🕒 {preparationTime} {mappedLocale === 'de' ? 'Minuten' : 'mins'}
          </span>
        )}
        {servings && (
          <span className={styles.detail}>
            🍽️ {servings} {mappedLocale === 'de' ? 'Portionen' : 'servings'}
          </span>
        )}
      </div>

      <h2>{mappedLocale === 'de' ? 'Zutaten' : 'Ingredients'}</h2>
      <ul className={styles.ingredientsList}>
        {ingredients.length > 0 ? (
          ingredients.map((ingredient, index) => (
            <li key={index}>
              {ingredient.name} <strong>{ingredient.quantity}</strong>
            </li>
          ))
        ) : (
          <p>
            {mappedLocale === 'de'
              ? 'Keine Zutaten verfügbar.'
              : 'No ingredients available.'}
          </p>
        )}
      </ul>
      <h2>{mappedLocale === 'de' ? 'Anleitung' : 'Instructions'}</h2>
      <div className={styles.instructions}>
        {documentToReactComponents(instructions)}
      </div>
      {youTubeUrl && (
        <div className={styles.youtubeContainer}>
          <h2>
            {mappedLocale === 'de'
              ? 'Video zur Orientierung'
              : 'Video for reference'}
          </h2>
          <iframe
            width="560"
            height="315"
            src={youTubeUrl}
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}
      {videoFile && (
        <div className={styles.videoContainer}>
          <h2>
            {mappedLocale === 'de'
              ? 'Video zur Orientierung'
              : 'Video for reference'}
          </h2>
          <video controls className={styles.video}>
            <source
              src={`https:${videoFile.fields.file.url}`}
              type={videoFile.fields.file.contentType}
            />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Disqus 댓글 섹션 */}
      <DisqusComments post={recipe} />

      {/* 홈으로 돌아가는 링크 */}
      <Link
        href="/"
        className={styles.backLink}
        aria-label={
          mappedLocale === 'de' ? 'Zurück zur Startseite' : 'Back to Home'
        }
      >
        {mappedLocale === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
      </Link>
    </div>
  );
};

export default RecipeDetail;
