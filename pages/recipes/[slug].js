import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import client from '../../lib/contentful';
import Image from 'next/image';
import styles from '../../styles/RecipeDetail.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Timer from '../../components/Timer';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { getYouTubeThumbnail } from '../../lib/getYouTubeThumbnail';
import Head from 'next/head';

const DisqusComments = dynamic(
  () => import('../../components/DisqusComments'),
  { ssr: false }
);
const Slider = dynamic(() => import('react-slick'), { ssr: false });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://leckere-koreanische-rezepte.de';

const renderContent = (content) => {
  if (!content) return null;
  if (typeof content === 'string') return content;
  if (content.nodeType) return documentToReactComponents(content);
  return content;
};

const richTextToPlainText = (content) => {
  if (!content) return '';
  if (typeof content === 'string') return content.trim();

  if (content.content && Array.isArray(content.content)) {
    return content.content
      .map((block) => {
        if (!block?.content) return '';
        return block.content.map((node) => node.value || '').join('');
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return '';
};

const stripHtmlLikeWhitespace = (text) =>
  (text || '').replace(/\s+/g, ' ').trim();

const truncateText = (text, maxLength = 155) => {
  const clean = stripHtmlLikeWhitespace(text);
  if (!clean) return '';
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 3).trim()}...`;
};

const formatDurationISO = (minutes) => {
  const num = Number(minutes);
  if (!Number.isFinite(num) || num <= 0) return undefined;
  return `PT${Math.round(num)}M`;
};

const getCategoryLabel = (category) => {
  if (Array.isArray(category)) return category.join(', ');
  if (typeof category === 'string') return category;
  if (category?.fields?.name) return category.fields.name;
  return 'Uncategorized';
};

export async function getStaticPaths() {
  try {
    const locales = ['de', 'en'];
    let paths = [];

    for (const locale of locales) {
      const res = await client.getEntries({
        content_type: 'recipe',
        select: 'fields.slug',
        locale,
        limit: 1000,
      });

      const localePaths = res.items
        .filter((item) => item.fields.slug)
        .map((item) => ({
          params: { slug: item.fields.slug.toLowerCase() },
          locale,
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
      const ingredientImageAsset = entry.fields.bild?.sys?.id
        ? assetsMap[entry.fields.bild.sys.id]
        : null;

      ingredientMap[entry.sys.id] = {
        name: entry.fields.name || 'Unknown Ingredient',
        slug: entry.fields.slug || null,
        description: entry.fields.description || null,
        bild: ingredientImageAsset?.fields?.file?.url
          ? `https:${ingredientImageAsset.fields.file.url}`
          : null,
      };
    });

    const ingredients =
      recipeEntry.fields.ingredients
        ?.map((ri) => {
          const recipeIngredient = recipeIngredientEntries.find(
            (entry) => entry.sys.id === ri.sys.id
          );
          if (!recipeIngredient) return null;

          const ingredientRef = recipeIngredient.fields.ingredient;
          const ingredientInfo = ingredientRef?.sys?.id
            ? ingredientMap[ingredientRef.sys.id]
            : {
                name: 'Unknown Ingredient',
                slug: null,
                description: null,
                bild: null,
              };

          return {
            id: recipeIngredient.sys.id,
            name: ingredientInfo?.name || 'Unknown Ingredient',
            slug: ingredientInfo?.slug || null,
            quantity: recipeIngredient.fields.quantity || '',
            description: ingredientInfo?.description || null,
            bild: ingredientInfo?.bild || null,
          };
        })
        .filter(Boolean) || [];

    const images =
      recipeEntry.fields.image?.map(
        (img) => `https:${assetsMap[img.sys.id].fields.file.url}`
      ) || [];

    const stepEntries =
      res.includes.Entry?.filter(
        (entry) => entry.sys.contentType.sys.id === 'step'
      ) || [];

    const steps =
      recipeEntry.fields.steps
        ?.map((s) => {
          const stepEntry = stepEntries.find(
            (entry) => entry.sys.id === s.sys.id
          );
          if (!stepEntry) return null;

          return {
            stepNumber: stepEntry.fields.stepNumber,
            description: stepEntry.fields.description,
            image: stepEntry.fields.image?.sys?.id
              ? `https:${assetsMap[stepEntry.fields.image.sys.id]?.fields?.file?.url}`
              : null,
            timerDuration: stepEntry.fields.timerDuration || null,
          };
        })
        .filter(Boolean) || [];

    const categoryLabel = getCategoryLabel(recipeEntry.fields.category);

    const finalRecipe = {
      id: recipeEntry.sys.id,
      titel: recipeEntry.fields.titel || 'Default Recipe Title',
      description:
        recipeEntry.fields.description ||
        'Default description: Find delicious recipes and tips.',
      images,
      category: categoryLabel,
      preparationTime: recipeEntry.fields.preparationTime || null,
      servings: recipeEntry.fields.servings || null,
      ingredients,
      instructions:
        recipeEntry.fields.instructions || 'No instructions provided.',
      videoFile: recipeEntry.fields.videoFile || null,
      youTubeUrl: recipeEntry.fields.youTubeUrl || null,
      slug: recipeEntry.fields.slug.toLowerCase(),
      title: recipeEntry.fields.titel || 'Default Recipe Title',
      locale: mappedLocale,
      steps,
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
  const { locale, asPath } = router;
  const mappedLocale = locale === 'de' ? 'de' : 'en';

  const safeRecipe = recipe || {
    titel: '',
    description: null,
    images: [],
    category: '',
    preparationTime: null,
    servings: null,
    ingredients: [],
    instructions: null,
    videoFile: null,
    youTubeUrl: null,
    steps: [],
  };

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
    steps,
  } = safeRecipe;

  const [checkedIngredients, setCheckedIngredients] = useState(
    safeRecipe.ingredients ? safeRecipe.ingredients.map(() => false) : []
  );
  const [checkedSteps, setCheckedSteps] = useState(
    safeRecipe.steps ? safeRecipe.steps.map(() => false) : []
  );

  const handleIngredientCheckboxChange = (index) => {
    setCheckedIngredients((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const handleStepCheckboxChange = (index) => {
    setCheckedSteps((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

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

  const ingredientCards = ingredients
    .filter((ingredient) => {
      const hasUsefulDetail =
        (typeof ingredient.description === 'string' &&
          ingredient.description.trim() !== '') ||
        (ingredient.description && typeof ingredient.description === 'object');

      const hasRealImage =
        ingredient.bild && ingredient.bild !== '/images/default.png';

      return ingredient.slug && (hasUsefulDetail || hasRealImage);
    })
    .slice(0, 6);

  const descriptionText = useMemo(() => {
    const fromDescription = richTextToPlainText(description);
    const fromInstructions = richTextToPlainText(instructions);

    const generated =
      mappedLocale === 'de'
        ? `${titel || 'Dieses Rezept'} ist ein koreanisches Rezept aus der Kategorie ${category || 'Korean Food'}. ${
            preparationTime
              ? `Zubereitungszeit: ${preparationTime} Minuten. `
              : ''
          }${servings ? `Für ${servings} Portionen. ` : ''}Schritt-für-Schritt erklärt mit Zutaten und praktischen Tipps.`
        : `${titel || 'This recipe'} is a Korean recipe in the ${category || 'Korean Food'} category. ${
            preparationTime
              ? `Preparation time: ${preparationTime} minutes. `
              : ''
          }${servings ? `Serves ${servings}. ` : ''}Step-by-step instructions, ingredients, and practical tips for everyday cooking.`;

    return truncateText(fromDescription || fromInstructions || generated, 160);
  }, [
    description,
    instructions,
    titel,
    category,
    preparationTime,
    servings,
    mappedLocale,
  ]);

  const pageTitle =
    mappedLocale === 'de'
      ? `${titel || 'Rezept'} Rezept | ${category || 'Korean Food'} | Hansik Young`
      : `${titel || 'Recipe'} Recipe | ${category || 'Korean Food'} | Hansik Young`;

  const canonicalUrl = `${SITE_URL}${asPath === '/' ? '' : asPath.split('?')[0]}`;
  const ogImage = images[0] || thumbnailUrl || `${SITE_URL}/images/default.png`;

  const schemaInstructions =
    steps && steps.length > 0
      ? [...steps]
          .sort((a, b) => a.stepNumber - b.stepNumber)
          .map((step) => ({
            '@type': 'HowToStep',
            name:
              mappedLocale === 'de'
                ? `Schritt ${step.stepNumber}`
                : `Step ${step.stepNumber}`,
            text: stripHtmlLikeWhitespace(
              richTextToPlainText(step.description)
            ),
            image: step.image || undefined,
          }))
      : [
          {
            '@type': 'HowToStep',
            text: stripHtmlLikeWhitespace(richTextToPlainText(instructions)),
          },
        ];

  const recipeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: titel || 'Recipe',
    description: descriptionText,
    image: images.length > 0 ? images : [ogImage],
    recipeCategory: category || 'Korean Food',
    inLanguage: mappedLocale,
    prepTime: formatDurationISO(preparationTime),
    totalTime: formatDurationISO(preparationTime),
    recipeYield: servings ? `${servings}` : undefined,
    recipeIngredient: ingredients.map(
      (ingredient) =>
        `${ingredient.name}${ingredient.quantity ? ` - ${ingredient.quantity}` : ''}`
    ),
    recipeInstructions: schemaInstructions,
    video: youTubeUrl
      ? {
          '@type': 'VideoObject',
          name: `${titel || 'Recipe'} video`,
          embedUrl: youTubeUrl,
          thumbnailUrl: thumbnailUrl,
        }
      : undefined,
  };

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

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={descriptionText} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={descriptionText} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Hansik Young" />
        <meta
          property="og:locale"
          content={mappedLocale === 'de' ? 'de_DE' : 'en_US'}
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={descriptionText} />
        <meta name="twitter:image" content={ogImage} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(recipeSchema),
          }}
        />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{titel}</h1>
          <div className={styles.summary}>
            <span>
              {mappedLocale === 'de' ? 'Kategorie' : 'Category'}: {category}
            </span>
            {preparationTime && (
              <span>
                🕒 {preparationTime}{' '}
                {mappedLocale === 'de' ? 'Minuten' : 'mins'}
              </span>
            )}
            {servings && (
              <span>
                🍽️ {servings} {mappedLocale === 'de' ? 'Portionen' : 'servings'}
              </span>
            )}
          </div>
        </header>

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

        <div className={styles.contentWrapper}>
          <aside className={styles.ingredientsColumn}>
            <h3>{mappedLocale === 'de' ? 'Zutaten' : 'Ingredients'}</h3>
            {ingredients.length > 0 ? (
              <ul className={styles.ingredientsList}>
                {ingredients.map((ingredient, index) => (
                  <li key={ingredient.id} className={styles.ingredientItem}>
                    <label>
                      <input
                        type="checkbox"
                        checked={checkedIngredients[index]}
                        onChange={() => handleIngredientCheckboxChange(index)}
                      />
                      <span
                        className={
                          checkedIngredients[index] ? styles.checked : ''
                        }
                      >
                        {ingredient.slug ? (
                          <Link
                            href={`/ingredients/${ingredient.slug}`}
                            className={styles.ingredientLink}
                          >
                            {ingredient.name}
                          </Link>
                        ) : (
                          ingredient.name
                        )}{' '}
                        <strong>{ingredient.quantity}</strong>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                {mappedLocale === 'de'
                  ? 'Keine Zutaten verfügbar.'
                  : 'No ingredients available.'}
              </p>
            )}
          </aside>

          <section className={styles.instructionsColumn}>
            <div className={styles.description}>
              {renderContent(description)}
            </div>

            {steps && steps.length > 0 ? (
              <div className={styles.stepsSection}>
                <h3>{mappedLocale === 'de' ? 'Schritte' : 'Steps'}</h3>
                <ol className={styles.stepList}>
                  {[...steps]
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map((step, index) => (
                      <li key={index} className={styles.stepItem}>
                        <div className={styles.stepHeader}>
                          <input
                            id={`step-checkbox-${index}`}
                            type="checkbox"
                            checked={checkedSteps[index]}
                            onChange={() => handleStepCheckboxChange(index)}
                            className={styles.stepCheckbox}
                          />
                          <label
                            htmlFor={`step-checkbox-${index}`}
                            className={styles.stepNumber}
                          >
                            {step.stepNumber}.
                          </label>

                          {step.timerDuration && (
                            <span
                              className={styles.stepTimer}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Timer duration={step.timerDuration} />
                            </span>
                          )}
                        </div>

                        <div className={styles.stepContent}>
                          <div
                            className={
                              checkedSteps[index] ? styles.checked : ''
                            }
                          >
                            <div className={styles.stepDescription}>
                              {renderContent(step.description)}
                            </div>
                          </div>
                          {step.image && (
                            <div className={styles.stepImage}>
                              <Image
                                src={step.image}
                                alt={`Step ${step.stepNumber} image`}
                                width={600}
                                height={400}
                                loading="lazy"
                                style={{ width: '100%', height: 'auto' }}
                              />
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                </ol>
              </div>
            ) : (
              <div className={styles.instructions}>
                <h3>{mappedLocale === 'de' ? 'Anleitung' : 'Instructions'}</h3>
                {renderContent(instructions)}
              </div>
            )}

            {ingredientCards.length > 0 && (
              <section className={styles.usedIngredientsSection}>
                <h3 className={styles.usedIngredientsTitle}>
                  {mappedLocale === 'de'
                    ? 'Verwendete Zutaten'
                    : 'Ingredients used in this recipe'}
                </h3>

                <div className={styles.usedIngredientsGrid}>
                  {ingredientCards.map((ingredient) => (
                    <Link
                      key={`${ingredient.id}-${ingredient.slug}`}
                      href={`/ingredients/${ingredient.slug}`}
                      className={styles.usedIngredientCard}
                    >
                      <div className={styles.usedIngredientImageWrap}>
                        <Image
                          src={ingredient.bild || '/images/default.png'}
                          alt={ingredient.name}
                          fill
                          className={styles.usedIngredientImage}
                        />
                      </div>
                      <div className={styles.usedIngredientContent}>
                        <h4>{ingredient.name}</h4>
                        {ingredient.quantity && (
                          <p className={styles.usedIngredientQty}>
                            {ingredient.quantity}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

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
          </section>
        </div>

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
