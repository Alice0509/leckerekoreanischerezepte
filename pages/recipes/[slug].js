import React from 'react';
import dynamic from 'next/dynamic';
import client from '../../lib/contentful';
import Image from 'next/image';
import styles from '../../styles/RecipeDetail.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { getYouTubeThumbnail } from '../../lib/getYouTubeThumbnail';
import Head from 'next/head';

const DisqusComments = dynamic(
  () => import('../../components/DisqusComments'),
  {
    ssr: false,
  }
);

const Slider = dynamic(() => import('react-slick'), { ssr: false });

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
        params: { slug: item.fields.slug.toLowerCase() },
        locale: locale,
      }));

      paths = paths.concat(localePaths);
    }

    return {
      paths,
      fallback: false,
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
      'fields.slug': slug.toLowerCase(),
      locale: mappedLocale,
      include: 3,
    });

    if (!res.items.length) {
      return { props: { recipe: null } };
    }

    const recipeEntry = res.items[0];

    const assetsMap = {};
    res.includes.Asset?.forEach((asset) => {
      assetsMap[asset.sys.id] = asset;
    });

    const recipeIngredientEntries =
      res.includes.Entry?.filter(
        (entry) => entry.sys.contentType.sys.id === 'recipeIngredient'
      ) || [];

    const ingredientEntries =
      res.includes.Entry?.filter(
        (entry) => entry.sys.contentType.sys.id === 'ingredient'
      ) || [];
    const ingredientMap = {};
    ingredientEntries.forEach((entry) => {
      ingredientMap[entry.sys.id] = entry.fields.name;
    });

    const ingredients =
      recipeEntry.fields.ingredients
        ?.map((ri) => {
          const recipeIngredient = recipeIngredientEntries.find(
            (entry) => entry.sys.id === ri.sys.id
          );
          if (!recipeIngredient) return null;

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
        .filter(Boolean) || [];

    const images =
      recipeEntry.fields.image?.map(
        (img) => `https:${assetsMap[img.sys.id].fields.file.url}`
      ) || [];

    const finalRecipe = {
      id: recipeEntry.sys.id,
      titel: recipeEntry.fields.titel || 'Default Recipe Title',
      description:
        recipeEntry.fields.description ||
        'Default description: Find delicious recipes and tips.',
      images,
      category: recipeEntry.fields.category || 'Uncategorized',
      preparationTime: recipeEntry.fields.preparationTime || 'N/A',
      servings: recipeEntry.fields.servings || 'N/A',
      ingredients,
      instructions:
        recipeEntry.fields.instructions || 'No instructions provided.',
      videoFile: recipeEntry.fields.videoFile || null,
      youTubeUrl: recipeEntry.fields.youTubeUrl || null,
      slug: recipeEntry.fields.slug.toLowerCase(),
      title: recipeEntry.fields.titel || 'Default Recipe Title',
      locale: mappedLocale,
    };

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

  const thumbnailUrl = youTubeUrl
    ? getYouTubeThumbnail(youTubeUrl)
    : '/images/default.png';

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <>
      <Head>
        <title>{`${titel} - ${
          mappedLocale === 'de' ? 'Einfaches Rezept' : 'Easy Recipe'
        }`}</title>
        <meta
          name="description"
          content={description || 'Find delicious recipes here!'}
        />
      </Head>
      <div className={styles.container}>
        <h1>{titel}</h1>

        {images.length > 0 || youTubeUrl ? (
          <div className={styles.imageWrapper}>
            <Slider {...sliderSettings}>
              {images.map((imgUrl, index) => (
                <div key={index} className={styles.slide}>
                  <Image
                    src={imgUrl}
                    alt={`${titel} image ${index + 1}`}
                    width={600}
                    height={400}
                    loading="lazy"
                    style={{ width: '100%', height: 'auto' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    className={styles.image}
                  />
                </div>
              ))}
              {!images.length && youTubeUrl && (
                <div className={styles.slide}>
                  <Image
                    src={thumbnailUrl}
                    alt={`${titel} YouTube thumbnail`}
                    width={600}
                    height={400}
                    style={{ width: '100%', height: 'auto' }}
                    className={styles.image}
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
              style={{ width: '100%', height: 'auto' }}
              className={styles.image}
            />
          </div>
        )}

        <div className={styles.description}>
          {documentToReactComponents(description)}
        </div>

        <h3>
          {mappedLocale === 'de' ? 'Kategorie' : 'Category'}: {category}
        </h3>

        <div className={styles.detailTexts}>
          {preparationTime && (
            <span className={styles.detailText}>
              🕒 {preparationTime} {mappedLocale === 'de' ? 'Minuten' : 'mins'}
            </span>
          )}
          {servings && (
            <span className={styles.detailText}>
              🍽️ {servings} {mappedLocale === 'de' ? 'Portionen' : 'servings'}
            </span>
          )}
        </div>

        <h3>{mappedLocale === 'de' ? 'Zutaten' : 'Ingredients'}</h3>
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

        <h3>{mappedLocale === 'de' ? 'Anleitung' : 'Instructions'}</h3>
        <div className={styles.instructions}>
          {documentToReactComponents(instructions)}
        </div>

        {youTubeUrl && (
          <div className={styles.youtubeContainer}>
            <h3>
              {mappedLocale === 'de'
                ? 'Video zur Orientierung'
                : 'Video for reference'}
            </h3>
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
            <h3>
              {mappedLocale === 'de'
                ? 'Video zur Orientierung'
                : 'Video for reference'}
            </h3>
            <video controls className={styles.video}>
              <source
                src={`https:${videoFile.fields.file.url}`}
                type={videoFile.fields.file.contentType}
              />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <DisqusComments post={recipe} />

        <Link
          href="/"
          className={styles.backLink}
          aria-label={
            mappedLocale === 'de' ? 'Zurück zur Startseite' : 'Back to Home'
          }
          tabIndex="0"
        >
          {mappedLocale === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
        </Link>
      </div>
    </>
  );
};

export default RecipeDetail;
