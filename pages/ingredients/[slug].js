import React, { useMemo } from 'react';
import client from '../../lib/contentful';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../../styles/IngredientDetail.module.css';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

const stripHtmlLikeWhitespace = (text) =>
  (text || '').replace(/\s+/g, ' ').trim();

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

const stripParentheses = (name = '') =>
  name.replace(/\s*\([^)]*\)\s*/g, '').trim();

const hasAnyKeyword = (value, keywords) => {
  const haystack = `${value || ''}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
};

const getIngredientGuide = ({ mainTitle, subTitle, slug, mappedLocale }) => {
  const label = mainTitle || 'Zutat';
  const cleanLabel = stripParentheses(label);
  const combined = `${label} ${subTitle || ''} ${slug || ''}`;
  const isGerman = mappedLocale === 'de';

  const defaultGuide = isGerman
    ? {
        eyebrow: 'Koreanische Zutat in Deutschland',
        headline: `${cleanLabel} kaufen und richtig verwenden`,
        intro: `${cleanLabel} gehört zu den Zutaten, die koreanisches Essen zu Hause einfacher machen. Hier findest du eine praktische Übersicht: wofür man die Zutat verwendet, wo du sie in Deutschland findest und welche Rezepte dazu passen.`,
        buyPlaces: [
          'Asia-Markt',
          'Koreanischer Online-Shop',
          'Große Supermärkte mit Asia-Regal',
        ],
        uses: [
          'Koreanische Hausmannskost',
          'Banchan und Beilagen',
          'Einfache Alltagsgerichte',
        ],
        tips: [
          'Achte auf die Zutatenliste und den Geschmack.',
          'Kaufe am Anfang lieber eine kleine Packung.',
          'Lagere die Zutat nach dem Öffnen so, wie es auf der Verpackung steht.',
        ],
        substitute:
          'Wenn du die Zutat nicht findest, nutze lieber eine einfache Alternative und passe den Geschmack vorsichtig an. Bei fermentierten Zutaten ist der Geschmack oft schwer exakt zu ersetzen.',
      }
    : {
        eyebrow: 'Korean ingredient guide',
        headline: `How to buy and use ${cleanLabel}`,
        intro: `${cleanLabel} is one of those ingredients that makes Korean cooking at home easier. This guide explains how to use it, where to find it, and which recipes work well with it.`,
        buyPlaces: [
          'Asian grocery store',
          'Korean online shop',
          'Large supermarkets with an Asian food section',
        ],
        uses: [
          'Korean home cooking',
          'Banchan and side dishes',
          'Easy everyday meals',
        ],
        tips: [
          'Check the ingredient list and flavor.',
          'Start with a small package if you are new to it.',
          'Store it according to the package instructions after opening.',
        ],
        substitute:
          'If you cannot find it, use a simple alternative and adjust the flavor carefully. Fermented ingredients are often hard to replace exactly.',
      };

  if (hasAnyKeyword(combined, ['gochujang', '고추장'])) {
    return isGerman
      ? {
          eyebrow: 'Scharfe koreanische Würzpaste',
          headline:
            'Gochujang kaufen in Deutschland: Geschmack, Verwendung und Ersatz',
          intro:
            'Gochujang ist eine koreanische Chilipaste mit Schärfe, Süße und fermentierter Tiefe. In Deutschland findest du sie meist im Asia-Markt, in koreanischen Online-Shops oder manchmal im gut sortierten Supermarkt.',
          buyPlaces: [
            'Asia-Markt',
            'Koreanischer Online-Shop',
            'Manche REWE- oder Edeka-Filialen mit großem Asia-Regal',
          ],
          uses: [
            'Bibimbap-Sauce',
            'Tteokbokki',
            'Jeyuk Bokkeum',
            'Marinaden',
            'Chogochujang',
            'Saucen für Gemüse und Bowls',
          ],
          tips: [
            'Wähle für den Anfang eine milde oder mittlere Schärfe.',
            'Nach dem Öffnen gut verschließen und im Kühlschrank lagern.',
            'Für Saucen immer mit etwas Wasser, Essig, Zucker oder Sesamöl ausbalancieren.',
          ],
          substitute:
            'Gochujang lässt sich nicht perfekt ersetzen. Für eine schnelle Notlösung kannst du Misopaste mit etwas Chili, Zucker und Sojasauce mischen. Der fermentierte, süß-scharfe Geschmack wird aber anders sein.',
        }
      : {
          eyebrow: 'Spicy Korean fermented paste',
          headline: 'Where to buy gochujang and how to use it',
          intro:
            'Gochujang is a Korean chili paste with heat, sweetness, and fermented depth. It is one of the most useful Korean pantry ingredients for quick sauces, marinades, and stews.',
          buyPlaces: [
            'Asian grocery store',
            'Korean online shop',
            'Some large supermarkets with a broad Asian food section',
          ],
          uses: [
            'Bibimbap sauce',
            'Tteokbokki',
            'Jeyuk bokkeum',
            'Marinades',
            'Chogochujang',
            'Vegetable and rice bowl sauces',
          ],
          tips: [
            'Start with mild or medium heat if you are new to it.',
            'Keep it well sealed in the fridge after opening.',
            'Balance it with water, vinegar, sugar, or sesame oil when making sauces.',
          ],
          substitute:
            'Gochujang is difficult to replace exactly. For a quick workaround, mix miso paste with chili, sugar, and soy sauce, but the flavor will not be identical.',
        };
  }

  if (hasAnyKeyword(combined, ['gochugaru', '고춧가루', 'chilipulver'])) {
    return isGerman
      ? {
          eyebrow: 'Koreanisches Chilipulver',
          headline:
            'Gochugaru kaufen in Deutschland: welches Chilipulver für Kimchi?',
          intro:
            'Gochugaru ist koreanisches Chilipulver mit fruchtiger Schärfe. Es ist wichtig für Kimchi, Suppen, Eintöpfe und viele scharfe koreanische Gerichte.',
          buyPlaces: [
            'Asia-Markt',
            'Koreanischer Online-Shop',
            'Online-Marktplätze mit koreanischen Lebensmitteln',
          ],
          uses: [
            'Kimchi',
            'Kimchi Jjigae',
            'Scharfe Suppen',
            'Banchan',
            'Marinaden',
          ],
          tips: [
            'Achte auf koreanisches Chilipulver, nicht auf geräuchertes Paprikapulver.',
            'Für Kimchi ist grobes Gochugaru oft praktischer.',
            'Kühl, trocken und dunkel lagern, damit Farbe und Aroma bleiben.',
          ],
          substitute:
            'Normales Chilipulver ist oft schärfer oder bitterer. Für Kimchi lohnt es sich, echtes Gochugaru zu kaufen.',
        }
      : defaultGuide;
  }

  if (hasAnyKeyword(combined, ['kimchi', '김치'])) {
    return isGerman
      ? {
          eyebrow: 'Fermentierter koreanischer Kohl',
          headline: 'Kimchi kaufen und verwenden: frisch, sauer oder gekocht',
          intro:
            'Kimchi ist fermentiertes Gemüse und eines der wichtigsten Lebensmittel in der koreanischen Küche. Es schmeckt als Beilage, in gebratenem Reis, in Pfannkuchen oder in Eintöpfen.',
          buyPlaces: [
            'Asia-Markt',
            'Koreanischer Online-Shop',
            'Manche Bio- oder Feinkostläden',
          ],
          uses: [
            'Beilage zu Reis',
            'Kimchi Jjigae',
            'Kimchi Fried Rice',
            'Kimchi Pancake',
            'Nudeln und Bowls',
          ],
          tips: [
            'Frisches Kimchi schmeckt milder und knackiger.',
            'Saueres Kimchi eignet sich besonders gut zum Kochen.',
            'Immer mit sauberem Besteck entnehmen und gekühlt lagern.',
          ],
          substitute:
            'Kimchi ist schwer zu ersetzen. Für manche Gerichte kann Sauerkraut mit Chili eine Notlösung sein, aber der koreanische Geschmack ist anders.',
        }
      : defaultGuide;
  }

  if (hasAnyKeyword(combined, ['sesamöl', 'sesame oil', '참기름'])) {
    return isGerman
      ? {
          eyebrow: 'Geröstetes Aroma für koreanische Gerichte',
          headline: 'Sesamöl für koreanische Küche: worauf du achten solltest',
          intro:
            'Geröstetes Sesamöl gibt vielen koreanischen Gerichten den typischen nussigen Duft. Schon eine kleine Menge reicht oft aus.',
          buyPlaces: [
            'Asia-Markt',
            'Koreanischer Online-Shop',
            'Manche Supermärkte',
          ],
          uses: ['Banchan', 'Bibimbap', 'Suppen-Finish', 'Marinaden', 'Dips'],
          tips: [
            'Achte auf geröstetes Sesamöl.',
            'Nicht stark erhitzen, sondern eher am Ende zugeben.',
            'Kühl und dunkel lagern.',
          ],
          substitute:
            'Ein anderes Öl ersetzt das Aroma nicht. Wenn du kein Sesamöl hast, lass es lieber weg und würze mit etwas mehr Sojasauce oder geröstetem Sesam.',
        }
      : defaultGuide;
  }

  if (hasAnyKeyword(combined, ['doenjang', '된장', 'soybean paste'])) {
    return isGerman
      ? {
          eyebrow: 'Koreanische Sojabohnenpaste',
          headline:
            'Doenjang kaufen und verwenden: koreanische Paste für Eintöpfe',
          intro:
            'Doenjang ist eine kräftige koreanische Sojabohnenpaste. Sie ist salzig, fermentiert und besonders wichtig für koreanische Suppen und Eintöpfe.',
          buyPlaces: [
            'Asia-Markt',
            'Koreanischer Online-Shop',
            'Koreanische Lebensmittelgeschäfte',
          ],
          uses: [
            'Doenjang Jjigae',
            'Suppen',
            'Ssamjang',
            'Marinaden',
            'Gemüsegerichte',
          ],
          tips: [
            'Der Geschmack ist kräftiger und herzhafter als viele milde Misopasten.',
            'Für den Anfang reicht eine kleine Packung.',
            'Nach dem Öffnen gut verschlossen im Kühlschrank lagern.',
          ],
          substitute:
            'Miso kann manchmal helfen, schmeckt aber milder und anders. Für Doenjang Jjigae ist echtes Doenjang deutlich besser.',
        }
      : defaultGuide;
  }

  if (hasAnyKeyword(combined, ['reis', 'rice', '쌀', 'milchreis', 'sushi'])) {
    return isGerman
      ? {
          eyebrow: 'Reis für koreanische Alltagsküche',
          headline: 'Welcher Reis passt zu koreanischem Essen?',
          intro:
            'Für viele koreanische Gerichte passt Rundkornreis oder Sushi-Reis gut. In Deutschland ist auch Milchreis als einfache Alltagslösung oft nützlich, wenn er ungesüßt gekocht wird.',
          buyPlaces: [
            'Asia-Markt',
            'Koreanischer Online-Shop',
            'REWE, Edeka oder andere Supermärkte',
          ],
          uses: [
            'Bibimbap',
            'Kimbap',
            'Kimchi Fried Rice',
            'Reisbeilage',
            'Jumeokbap',
          ],
          tips: [
            'Reis vor dem Kochen waschen, bis das Wasser klarer wird.',
            'Für Kimbap sollte der Reis klebrig genug sein.',
            'Gekochten Reis für Fried Rice am besten abkühlen lassen.',
          ],
          substitute:
            'Langkornreis funktioniert für manche Bowls, ist aber für Kimbap oft zu locker. Für koreanische Reisrollen besser Rundkorn- oder Sushi-Reis wählen.',
        }
      : defaultGuide;
  }

  return defaultGuide;
};

const getFaqItems = ({ guide, mainTitle, mappedLocale }) => {
  const label = stripParentheses(mainTitle || 'diese Zutat');

  if (mappedLocale === 'de') {
    return [
      {
        question: `Wo kann ich ${label} in Deutschland kaufen?`,
        answer: `Meist findest du ${label} im Asia-Markt, in koreanischen Online-Shops oder in größeren Supermärkten mit gutem Asia-Regal.`,
      },
      {
        question: `Wofür verwendet man ${label}?`,
        answer: guide.uses.join(', '),
      },
      {
        question: `Kann ich ${label} ersetzen?`,
        answer: guide.substitute,
      },
      {
        question: `Wie lagere ich ${label}?`,
        answer:
          'Orientiere dich immer an der Verpackung. Viele koreanische Pasten und geöffnete Produkte bleiben gut verschlossen im Kühlschrank am besten.',
      },
    ];
  }

  return [
    {
      question: `Where can I buy ${label}?`,
      answer: `You can usually find ${label} in Asian grocery stores, Korean online shops, or larger supermarkets with a good Asian food section.`,
    },
    {
      question: `How do I use ${label}?`,
      answer: guide.uses.join(', '),
    },
    {
      question: `Can I substitute ${label}?`,
      answer: guide.substitute,
    },
    {
      question: `How should I store ${label}?`,
      answer:
        'Always follow the package instructions. Many Korean pastes and opened products keep best sealed in the fridge.',
    },
  ];
};

const PRIORITY_INGREDIENT_SLUG_KEYWORDS = [
  'gochujang',
  'gochugaru',
  'kimchi',
  'reis',
  'rice',
  'tofu',
  'sesam',
  'sesame',
  'doenjang',
  'sojasauce',
  'soy',
  'nori',
  'gim',
  'dangmyeon',
  'tteok',
];

const isPriorityIngredientSlug = (slug = '') => {
  const normalized = `${slug}`.toLowerCase();
  return PRIORITY_INGREDIENT_SLUG_KEYWORDS.some((keyword) =>
    normalized.includes(keyword)
  );
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
        .filter((item) => isPriorityIngredientSlug(item.fields.slug))
        .map((item) => ({
          params: { slug: item.fields.slug },
          locale,
        }));

      allPaths.push(...localePaths);
    }

    return {
      paths: allPaths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching ingredient slugs:', error);
    return {
      paths: [],
      fallback: 'blocking',
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
      seoTitle: item.fields.seoTitle || null,
      seoDescription: item.fields.seoDescription || null,
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
    seoTitle: null,
    seoDescription: null,
  };

  const {
    name,
    germanMeatCut,
    bild,
    description,
    slug,
    seoTitle,
    seoDescription,
  } = safeIngredient;

  const match = name ? name.match(/^([^(]+)\((.+)\)$/) : null;
  const mainTitle = match ? match[1].trim() : name;
  const subTitle = match ? match[2].trim() : '';
  const isGerman = mappedLocale === 'de';
  const guide = useMemo(
    () => getIngredientGuide({ mainTitle, subTitle, slug, mappedLocale }),
    [mainTitle, mappedLocale, slug, subTitle]
  );
  const faqItems = useMemo(
    () => getFaqItems({ guide, mainTitle, mappedLocale }),
    [guide, mainTitle, mappedLocale]
  );

  const descriptionText = useMemo(() => {
    const fromSeoDescription = stripHtmlLikeWhitespace(seoDescription);
    const fromDescription = richTextToPlainText(description);
    return truncateText(
      fromSeoDescription || fromDescription || guide.intro,
      160
    );
  }, [description, guide.intro, seoDescription]);

  const pageTitle = seoTitle
    ? `${stripHtmlLikeWhitespace(seoTitle)} | Hansik Young`
    : `${guide.headline} | Hansik Young`;

  const currentPath = router.asPath
    ? router.asPath.split('?')[0]
    : `/${isGerman ? 'de' : 'en'}/ingredients/${slug}`;

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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!ingredient) {
    return (
      <div className={styles.noIngredient}>
        {isGerman ? 'Zutat nicht gefunden.' : 'Ingredient not found.'}
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
        <meta property="og:locale" content={isGerman ? 'de_DE' : 'en_US'} />

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      </Head>

      <div className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{guide.eyebrow}</p>
          <h1 className={styles.title}>{guide.headline}</h1>
          {subTitle && <p className={styles.subtitle}>{subTitle}</p>}
          <p className={styles.heroText}>{guide.intro}</p>
          <div className={styles.heroActions}>
            <Link href="/ingredients" className={styles.secondaryButton}>
              {isGerman ? 'Alle Zutaten ansehen' : 'View all ingredients'}
            </Link>
            {relatedRecipes.length > 0 && (
              <a href="#recipes" className={styles.primaryButton}>
                {isGerman ? 'Rezepte damit finden' : 'Find recipes'}
              </a>
            )}
            <Link href="/gallery" className={styles.secondaryButton}>
              {isGerman ? 'Meine Einkaufsliste' : 'My shopping list'}
            </Link>
          </div>
        </header>

        <section
          className={styles.overviewGrid}
          aria-label="Ingredient overview"
        >
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

          <div className={styles.quickFacts}>
            <h2>{isGerman ? 'Kurz gesagt' : 'At a glance'}</h2>
            <ul>
              <li>
                <strong>{isGerman ? 'Kaufen:' : 'Buy:'}</strong>{' '}
                {guide.buyPlaces.slice(0, 2).join(', ')}
              </li>
              <li>
                <strong>{isGerman ? 'Verwendung:' : 'Use for:'}</strong>{' '}
                {guide.uses.slice(0, 3).join(', ')}
              </li>
              <li>
                <strong>{isGerman ? 'Tipp:' : 'Tip:'}</strong> {guide.tips[0]}
              </li>
              {germanMeatCut && (
                <li>
                  <strong>{isGerman ? 'Stück:' : 'Cut:'}</strong>{' '}
                  {germanMeatCut}
                </li>
              )}
            </ul>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>
            {isGerman ? 'Was ist diese Zutat?' : 'What is this ingredient?'}
          </h2>
          <div className={styles.description}>
            {description
              ? documentToReactComponents(description)
              : isGerman
                ? 'Keine Beschreibung verfügbar.'
                : 'No description available.'}
          </div>
        </section>

        <section className={styles.guideGrid}>
          <article className={styles.infoCard}>
            <h2>{isGerman ? 'Wo kaufen?' : 'Where to buy it'}</h2>
            <ul>
              {guide.buyPlaces.map((place) => (
                <li key={place}>{place}</li>
              ))}
            </ul>
          </article>

          <article className={styles.infoCard}>
            <h2>{isGerman ? 'Wofür verwenden?' : 'How to use it'}</h2>
            <ul>
              {guide.uses.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </article>

          <article className={styles.infoCard}>
            <h2>{isGerman ? 'Worauf achten?' : 'What to check'}</h2>
            <ul>
              {guide.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className={styles.guideSection}>
          <h2>
            {isGerman ? 'Kann man es ersetzen?' : 'Can you substitute it?'}
          </h2>
          <p className={styles.substituteText}>{guide.substitute}</p>
        </section>

        {favoriteProducts.length > 0 && (
          <section className={styles.favoriteSection}>
            <h2 className={styles.favoriteTitle}>
              {isGerman
                ? 'Meine Einkaufsliste zu dieser Zutat'
                : 'My shopping notes for this ingredient'}
            </h2>
            <p className={styles.sectionIntro}>
              {isGerman
                ? 'Hier sammle ich Produkte, die ich selbst kaufe oder im Alltag benutze.'
                : 'I keep products here that I buy myself or use in everyday cooking.'}
            </p>

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
                                {isGerman
                                  ? `Link ${idx + 1}`
                                  : `Link ${idx + 1}`}
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
          <section id="recipes" className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>
              {isGerman
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

        <section className={styles.faqSection}>
          <h2>{isGerman ? 'Häufige Fragen' : 'Frequently asked questions'}</h2>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <article key={item.question} className={styles.faqItem}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default IngredientDetail;
