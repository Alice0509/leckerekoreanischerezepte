import React, { useMemo } from 'react';
import client from '../../lib/contentful';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/IngredientDetail.module.css';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

const loadingSpinner =
  'data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAACH5BAEAAAEALAAAAAAQABAAAAIgjI+py+0Po5y02ouzPgUAOw==';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://leckere-koreanische-rezepte.de';

const ingredientCache = {};

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

const truncateText = (text, maxLength = 160) => {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 3).trim()}...`;
};

export async function getStaticPaths({ locales }) {
  try {
    const allPaths = [];

    for (const locale of locales) {
      const mappedLocale = locale === 'de' ? 'de' : 'en';

      const res = await client.getEntries({
        content_type: 'ingredient',
        select: 'fields.slug',
        locale: mappedLocale,
        include: 0,
        limit: 1000,
      });

      const localePaths = res.items
        .filter((item) => item.fields.slug)
        .map((item) => ({
          params: { slug: item.fields.slug },
          locale,
        }));

      allPaths.push(...localePaths);
    }

    return {
      paths: allPaths,
      fallback: false,
    };
  } catch (error) {
    console.error('Error fetching ingredient slugs:', error);
    return {
      paths: [],
      fallback: false,
    };
  }
}

export async function getStaticProps({ params, locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en';
    const cacheKey = `${mappedLocale}_${params.slug}`;

    if (ingredientCache[cacheKey]) {
      return {
        props: ingredientCache[cacheKey],
        revalidate: 60,
      };
    }

    let ingredientRes = await client.getEntries({
      content_type: 'ingredient',
      'fields.slug': params.slug,
      locale: mappedLocale,
      include: 1,
      limit: 1,
    });

    if (!ingredientRes.items.length && mappedLocale === 'de') {
      ingredientRes = await client.getEntries({
        content_type: 'ingredient',
        'fields.slug': params.slug,
        locale: 'en',
        include: 1,
        limit: 1,
      });
    }

    if (!ingredientRes.items.length) {
      return { notFound: true };
    }

    const item = ingredientRes.items[0];
    const imageAsset = item.fields.bild || null;
    const imageUrl = imageAsset ? `https:${imageAsset.fields.file.url}` : null;

    const ingredient = {
      id: item.sys.id,
      name: item.fields.name || '',
      slug: item.fields.slug || '',
      germanMeatCut: item.fields.germanMeatCut || null,
      bild: imageUrl,
      description: item.fields.description || null,
    };

    let favoriteRes = await client.getEntries({
      content_type: 'favoriteItem',
      locale: mappedLocale,
      include: 2,
      limit: 1000,
      'fields.relatedIngredients.sys.id': ingredient.id,
    });

    if (!favoriteRes.items.length && mappedLocale === 'de') {
      favoriteRes = await client.getEntries({
        content_type: 'favoriteItem',
        locale: 'en',
        include: 2,
        limit: 1000,
        'fields.relatedIngredients.sys.id': ingredient.id,
      });
    }

    const favoriteProducts = favoriteRes.items.map((fav) => {
      const favImage = fav.fields.image?.fields?.file?.url
        ? `https:${fav.fields.image.fields.file.url}`
        : null;

      const rawLinks = Array.isArray(fav.fields.links)
        ? fav.fields.links
        : fav.fields.link
          ? [fav.fields.link]
          : [];

      const links = rawLinks.filter(
        (link) => typeof link === 'string' && link.trim() !== ''
      );

      return {
        id: fav.sys.id,
        title: fav.fields.title || '',
        memo: fav.fields.memo || '',
        image: favImage,
        links,
      };
    });

    const recipeRes = await client.getEntries({
      content_type: 'recipe',
      locale: mappedLocale,
      include: 2,
      limit: 1000,
    });

    const assetsMap = {};
    recipeRes.includes?.Asset?.forEach((asset) => {
      assetsMap[asset.sys.id] = asset;
    });

    const recipeIngredientEntries =
      recipeRes.includes?.Entry?.filter(
        (entry) => entry.sys.contentType.sys.id === 'recipeIngredient'
      ) || [];

    const ingredientEntries =
      recipeRes.includes?.Entry?.filter(
        (entry) => entry.sys.contentType.sys.id === 'ingredient'
      ) || [];

    const ingredientNameMap = {};
    ingredientEntries.forEach((entry) => {
      ingredientNameMap[entry.sys.id] = {
        name: entry.fields.name || '',
        slug: entry.fields.slug || '',
      };
    });

    const relatedRecipes = recipeRes.items
      .filter((recipe) => {
        const recipeIngredients = recipe.fields.ingredients || [];

        return recipeIngredients.some((ri) => {
          const recipeIngredient = recipeIngredientEntries.find(
            (entry) => entry.sys.id === ri.sys.id
          );
          if (!recipeIngredient) return false;

          const ingredientRef = recipeIngredient.fields.ingredient;
          if (!ingredientRef?.sys?.id) return false;

          const linkedIngredient = ingredientNameMap[ingredientRef.sys.id];
          if (!linkedIngredient) return false;

          return linkedIngredient.slug === ingredient.slug;
        });
      })
      .map((recipe) => {
        let recipeImage = '/images/default.png';

        if (
          Array.isArray(recipe.fields.image) &&
          recipe.fields.image.length > 0
        ) {
          const firstImage = recipe.fields.image[0];
          if (
            firstImage?.sys?.id &&
            assetsMap[firstImage.sys.id]?.fields?.file?.url
          ) {
            recipeImage = `https:${assetsMap[firstImage.sys.id].fields.file.url}`;
          }
        } else if (
          recipe.fields.image?.sys?.id &&
          assetsMap[recipe.fields.image.sys.id]?.fields?.file?.url
        ) {
          recipeImage = `https:${assetsMap[recipe.fields.image.sys.id].fields.file.url}`;
        }

        return {
          id: recipe.sys.id,
          slug: recipe.fields.slug || '',
          titel: recipe.fields.titel || '',
          image: recipeImage,
        };
      })
      .slice(0, 6);

    const props = {
      ingredient,
      favoriteProducts,
      relatedRecipes,
      mappedLocale,
    };

    ingredientCache[cacheKey] = props;

    return {
      props,
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    return {
      props: {
        ingredient: null,
        favoriteProducts: [],
        relatedRecipes: [],
        error: 'Failed to fetch ingredient.',
        mappedLocale: locale === 'de' ? 'de' : 'en',
      },
      revalidate: 60,
    };
  }
}

const IngredientDetail = ({
  ingredient,
  favoriteProducts,
  relatedRecipes,
  error,
  mappedLocale,
}) => {
  const router = useRouter();

  const safeIngredient = ingredient || {
    name: '',
    germanMeatCut: null,
    bild: null,
    description: null,
    slug: '',
  };

  const { name, germanMeatCut, bild, description, slug } = safeIngredient;

  const match = name ? name.match(/^([^(]+)\((.+)\)$/) : null;
  const mainTitle = match ? match[1].trim() : name;
  const subTitle = match ? match[2].trim() : '';

  const descriptionText = useMemo(() => {
    const fromDescription = richTextToPlainText(description);

    const generated =
      mappedLocale === 'de'
        ? `${mainTitle || 'Diese Zutat'} ist eine koreanische Zutat. Erfahre, wie sie verwendet wird, entdecke passende Produkte und finde Rezepte mit dieser Zutat.`
        : `${mainTitle || 'This ingredient'} is a Korean ingredient. Learn how it is used, discover products I use, and find recipes that include this ingredient.`;

    return truncateText(fromDescription || generated, 160);
  }, [description, mainTitle, mappedLocale]);

  const pageTitle =
    mappedLocale === 'de'
      ? `${mainTitle || 'Zutat'} | Koreanische Zutat erklärt | Hansik Young`
      : `${mainTitle || 'Ingredient'} | Korean Ingredient Guide | Hansik Young`;

  const currentPath = router.asPath
    ? router.asPath.split('?')[0]
    : `/${mappedLocale === 'de' ? 'de' : 'en'}/ingredients/${slug}`;

  const canonicalUrl = `${SITE_URL}${currentPath}`;
  const ogImage = bild || `${SITE_URL}/images/default.png`;

  const ingredientSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: mainTitle || 'Ingredient',
    description: descriptionText,
    url: canonicalUrl,
    inDefinedTermSet: `${SITE_URL}/ingredients`,
  };

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description: descriptionText,
    url: canonicalUrl,
    primaryImageOfPage: ogImage,
    about: {
      '@type': 'Thing',
      name: mainTitle || 'Ingredient',
    },
  };

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
            __html: JSON.stringify(ingredientSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webpageSchema),
          }}
        />
      </Head>

      <div className={styles.container}>
        <header className={styles.titleHeader}>
          <h1 className={styles.title}>{mainTitle}</h1>
          {subTitle && <p className={styles.subtitle}>{subTitle}</p>}
        </header>

        {bild && (
          <div className={styles.imageWrapper}>
            <Image
              src={bild}
              alt={name}
              width={600}
              height={400}
              className={styles.image}
              placeholder="blur"
              blurDataURL={loadingSpinner}
            />
          </div>
        )}

        {germanMeatCut && (
          <p className={styles.meatCut}>
            {mappedLocale === 'de' ? 'Stück:' : 'Cut:'} {germanMeatCut}
          </p>
        )}

        <div className={styles.description}>
          {description
            ? documentToReactComponents(description)
            : mappedLocale === 'de'
              ? 'Keine Beschreibung verfügbar.'
              : 'No description available.'}
        </div>

        {favoriteProducts.length > 0 && (
          <section className={styles.favoriteSection}>
            <h2 className={styles.favoriteTitle}>
              {mappedLocale === 'de'
                ? 'Meine empfohlenen Produkte für diese Zutat'
                : 'My favorite products for this ingredient'}
            </h2>

            <div className={styles.favoriteGrid}>
              {favoriteProducts.map((product, index) => {
                const colorClass =
                  index % 3 === 0
                    ? styles.memoYellow
                    : index % 3 === 1
                      ? styles.memoPink
                      : styles.memoBlue;

                return (
                  <article
                    key={product.id}
                    className={`${styles.favoriteCard} ${colorClass}`}
                  >
                    {product.image && (
                      <div className={styles.favoriteImageWrap}>
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className={styles.favoriteImage}
                        />
                      </div>
                    )}

                    <div className={styles.favoriteContent}>
                      <h3>{product.title}</h3>
                      {product.memo && <p>{product.memo}</p>}

                      {product.links.length > 0 && (
                        <ul className={styles.favoriteLinks}>
                          {product.links.map((url, idx) => (
                            <li key={url}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.favoriteLink}
                              >
                                {mappedLocale === 'de'
                                  ? `Kaufoption ${idx + 1}`
                                  : `Buy option ${idx + 1}`}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {relatedRecipes.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>
              {mappedLocale === 'de'
                ? 'Rezepte mit dieser Zutat'
                : 'Recipes using this ingredient'}
            </h2>

            <div className={styles.relatedGrid}>
              {relatedRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImageWrap}>
                    <Image
                      src={recipe.image}
                      alt={recipe.titel}
                      fill
                      className={styles.relatedImage}
                    />
                  </div>
                  <div className={styles.relatedContent}>
                    <h3>{recipe.titel}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default IngredientDetail;
