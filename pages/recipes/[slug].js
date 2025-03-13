import React, { useState } from 'react';
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
  { ssr: false }
);
const Slider = dynamic(() => import('react-slick'), { ssr: false });

// 헬퍼 함수: rich text가 문자열이면 그대로, 객체이면 변환
const renderContent = (content) => {
  if (!content) return null;
  if (typeof content === 'string') return content;
  if (content.nodeType) return documentToReactComponents(content);
  return content;
};

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

    // 재료 데이터 처리
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

    // 이미지 처리
    const images =
      recipeEntry.fields.image?.map(
        (img) => `https:${assetsMap[img.sys.id].fields.file.url}`
      ) || [];

    // 스텝 단계 데이터 처리 (스텝이 없는 경우도 고려)
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
            // stepName은 필요 없으므로 생략합니다.
            description: stepEntry.fields.description,
            image: stepEntry.fields.image?.sys?.id
              ? `https:${assetsMap[stepEntry.fields.image.sys.id]?.fields?.file?.url}`
              : null,
            timerDuration: stepEntry.fields.timerDuration || null,
          };
        })
        .filter(Boolean) || [];

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
      steps, // 스텝 단계 추가
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

  // 항상 최상단에서 훅 호출
  const [checkedIngredients, setCheckedIngredients] = useState(
    recipe?.ingredients ? recipe.ingredients.map(() => false) : []
  );
  const [checkedSteps, setCheckedSteps] = useState(
    recipe?.steps ? recipe.steps.map(() => false) : []
  );

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
    steps,
  } = recipe;

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
        {/* 비주얼 중심 헤더 */}
        <header className={styles.header}>
          <h1 className={styles.title}>{titel}</h1>
          <div className={styles.summary}>
            <span>
              {mappedLocale === 'de' ? 'Kategorie' : 'Category'}: {category}
            </span>
            <span>
              🕒 {preparationTime} {mappedLocale === 'de' ? 'Minuten' : 'mins'}
            </span>
            <span>
              🍽️ {servings} {mappedLocale === 'de' ? 'Portionen' : 'servings'}
            </span>
          </div>
        </header>

        {/* 대표 이미지 슬라이더 */}
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

        {/* 2단 레이아웃: 좌측 재료 목록 & 우측 조리 과정 */}
        <div className={styles.contentWrapper}>
          {/* 좌측: Sticky 재료 목록 (체크박스 포함) */}
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
                        {ingredient.name} <strong>{ingredient.quantity}</strong>
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

          {/* 우측: 조리 과정 및 추가 설명 */}
          <section className={styles.instructionsColumn}>
            <div className={styles.description}>
              {renderContent(description)}
            </div>

            {/* 스텝 단계가 있으면 우선 렌더링 (체크 기능 포함) */}
            {steps && steps.length > 0 ? (
              <div className={styles.stepsSection}>
                <h3>{mappedLocale === 'de' ? 'Schritte' : 'Steps'}</h3>
                <ol className={styles.stepList}>
                  {steps
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map((step, index) => (
                      <li key={index} className={styles.stepItem}>
                        <label className={styles.stepLabel}>
                          <input
                            type="checkbox"
                            checked={checkedSteps[index]}
                            onChange={() => handleStepCheckboxChange(index)}
                          />
                          <span
                            className={
                              checkedSteps[index] ? styles.checked : ''
                            }
                          >
                            <span className={styles.stepNumber}>
                              {step.stepNumber}.
                            </span>
                            {step.timerDuration && (
                              <span className={styles.stepTimer}>
                                ({step.timerDuration} sec)
                              </span>
                            )}
                            <div className={styles.stepDescription}>
                              {renderContent(step.description)}
                            </div>
                          </span>
                        </label>
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
