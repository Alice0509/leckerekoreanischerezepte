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

const hasAnyKeyword = (value, keywords) => {
  const haystack = `${value || ''}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
};

const getRecipeGuide = ({ title, slug, ingredients, mappedLocale }) => {
  const combined = `${title || ''} ${slug || ''} ${ingredients
    .map((ingredient) => ingredient.name)
    .join(' ')}`;
  const isGerman = mappedLocale === 'de';

  const defaultGuide = isGerman
    ? {
        eyebrow: 'Koreanisch kochen in Deutschland',
        introTitle: 'Warum dieses Rezept gut für den Alltag funktioniert',
        intro:
          'Dieses Rezept ist für die Küche zu Hause gedacht: mit klaren Schritten, verlinkten Zutaten und möglichst realistischen Einkaufsmöglichkeiten in Deutschland.',
        shoppingTitle: 'Zutaten in Deutschland finden',
        shoppingText:
          'Viele koreanische Grundzutaten findest du im Asia-Markt oder online. Einzelne frische Zutaten lassen sich oft durch Produkte aus REWE, Edeka oder dem Wochenmarkt ersetzen.',
        tips: [
          'Lies zuerst die Zutatenliste und klicke unbekannte Zutaten an.',
          'Bereite Sauce und geschnittenes Gemüse vor, bevor du mit dem Kochen beginnst.',
          'Schmecke am Ende vorsichtig mit Salz, Sojasauce, Zucker oder Sesamöl ab.',
        ],
        faq: [
          {
            question: isGerman
              ? 'Kann ich das Rezept auch als Anfänger kochen?'
              : 'Can beginners make this recipe?',
            answer: isGerman
              ? 'Ja. Lies die Schritte einmal komplett durch und bereite die Zutaten vor, bevor du beginnst.'
              : 'Yes. Read the steps once and prepare the ingredients before you start cooking.',
          },
          {
            question: isGerman
              ? 'Wo finde ich koreanische Zutaten in Deutschland?'
              : 'Where can I find Korean ingredients?',
            answer: isGerman
              ? 'Am einfachsten im Asia-Markt, in koreanischen Online-Shops oder teilweise in großen Supermärkten mit Asia-Regal.'
              : 'The easiest options are Asian grocery stores, Korean online shops, or large supermarkets with an Asian food section.',
          },
        ],
      }
    : {
        eyebrow: 'Korean cooking at home',
        introTitle: 'Why this recipe works for everyday cooking',
        intro:
          'This recipe is designed for home cooking with clear steps, linked ingredients, and practical shopping notes.',
        shoppingTitle: 'Finding the ingredients',
        shoppingText:
          'Many Korean pantry ingredients are easiest to find in Asian grocery stores or online. Fresh ingredients can often be replaced with supermarket options.',
        tips: [
          'Read the ingredient list first and open unfamiliar ingredients.',
          'Prepare sauces and vegetables before you start cooking.',
          'Adjust the final flavor with soy sauce, salt, sugar, or sesame oil.',
        ],
        faq: [
          {
            question: 'Can beginners make this recipe?',
            answer:
              'Yes. Read the steps once and prepare the ingredients before you start cooking.',
          },
          {
            question: 'Where can I find Korean ingredients?',
            answer:
              'Asian grocery stores, Korean online shops, and large supermarkets with an Asian section are the easiest places to start.',
          },
        ],
      };

  if (
    hasAnyKeyword(combined, [
      'kimchi jjigae',
      'kimchi-jjigae',
      'kimchijjigae',
      '김치찌개',
    ])
  ) {
    return isGerman
      ? {
          eyebrow: 'Koreanischer Eintopf',
          introTitle: 'Kimchi Jjigae einfach zu Hause kochen',
          intro:
            'Kimchi Jjigae ist ein herzhafter koreanischer Kimchi-Eintopf. Besonders gut wird er mit reiferem, leicht saurem Kimchi und einer kleinen Menge Fett oder Brühe für mehr Tiefe.',
          shoppingTitle: 'Was du in Deutschland dafür brauchst',
          shoppingText:
            'Kimchi, Schweinefleisch oder Thunfisch und Zwiebeln findest du gut in Deutschland. Reiswasser ist ideal, normales Wasser funktioniert aber auch. Tofu ist nicht Teil dieses Grundrezepts, kann aber optional gegen Ende mitgekocht werden.',
          tips: [
            'Saueres Kimchi eignet sich besser zum Kochen als ganz frisches Kimchi.',
            'Brate Zwiebel, Fleisch oder Thunfisch und Kimchi kurz an, bevor Flüssigkeit dazukommt – das macht den Geschmack runder.',
            'Tofu ist optional. Wenn du ihn verwenden möchtest, gib ihn erst gegen Ende dazu, damit er nicht zerfällt.',
          ],
          faq: [
            {
              question: 'Welches Kimchi eignet sich für Kimchi Jjigae?',
              answer:
                'Am besten funktioniert reiferes, leicht saures Kimchi. Ganz frisches Kimchi schmeckt milder und braucht oft etwas mehr Würze.',
            },
            {
              question: 'Kann ich Kimchi Jjigae vegetarisch kochen?',
              answer:
                'Ja. Lass Fleisch oder Thunfisch weg und nutze Pilze, Tofu optional und eine Gemüsebrühe oder Dashima-Brühe.',
            },
          ],
        }
      : defaultGuide;
  }

  if (hasAnyKeyword(combined, ['bibimbap', '비빔밥'])) {
    return isGerman
      ? {
          eyebrow: 'Koreanische Reis-Bowl',
          introTitle: 'Bibimbap mit Zutaten aus Deutschland',
          intro:
            'Bibimbap ist ideal, wenn du Reis, Gemüse, Ei und eine würzige Sauce kombinieren möchtest. Das Rezept lässt sich sehr gut mit saisonalem Gemüse aus deutschen Supermärkten anpassen.',
          shoppingTitle: 'Was du gut ersetzen kannst',
          shoppingText:
            'Für Bibimbap brauchst du nicht immer exakt koreanisches Gemüse. Karotten, Spinat, Zucchini, Pilze, Gurke und Sojasprossen funktionieren sehr gut.',
          tips: [
            'Gemüse getrennt anbraten oder blanchieren, damit jede Zutat ihren eigenen Geschmack behält.',
            'Gochujang-Sauce mit Wasser, Essig, Zucker und Sesamöl cremig rühren.',
            'Reis nicht zu weich kochen, damit die Bowl nicht matschig wird.',
          ],
          faq: [
            {
              question: 'Kann ich Bibimbap ohne Gochujang machen?',
              answer:
                'Ja, aber der typische Geschmack fehlt. Eine milde Alternative ist Sojasauce mit Sesamöl, etwas Zucker und Knoblauch.',
            },
            {
              question: 'Welches Gemüse passt zu Bibimbap?',
              answer:
                'Karotten, Spinat, Zucchini, Pilze, Gurke, Sojasprossen und Reste aus dem Kühlschrank passen gut.',
            },
          ],
        }
      : defaultGuide;
  }

  if (hasAnyKeyword(combined, ['tteokbokki', '떡볶이'])) {
    return isGerman
      ? {
          eyebrow: 'Koreanisches Street Food',
          introTitle: 'Tteokbokki zu Hause machen',
          intro:
            'Tteokbokki besteht aus Reiskuchen in einer süß-scharfen Gochujang-Sauce. Wichtig ist, die Sauce langsam einkochen zu lassen, bis sie glänzend und dick wird.',
          shoppingTitle: 'Reiskuchen und Sauce in Deutschland kaufen',
          shoppingText:
            'Tteokbokki-Reiskuchen findest du meist tiefgekühlt oder vakuumverpackt im Asia-Markt oder online. Gochujang und Gochugaru sind für den typischen Geschmack sehr hilfreich.',
          tips: [
            'Gefrorene Reiskuchen vorher kurz in Wasser einweichen.',
            'Die Sauce bei mittlerer Hitze einkochen lassen und regelmäßig rühren.',
            'Für eine mildere Version weniger Gochugaru verwenden und mit etwas Zucker ausbalancieren.',
          ],
          faq: [
            {
              question: 'Warum sind meine Reiskuchen hart?',
              answer:
                'Sie waren wahrscheinlich nicht lange genug eingeweicht oder gekocht. Gib etwas Wasser dazu und köchle sie weiter.',
            },
            {
              question: 'Kann ich Tteokbokki weniger scharf machen?',
              answer:
                'Ja. Nimm weniger Gochugaru, wähle mildes Gochujang und runde die Sauce mit Zucker oder etwas Sirup ab.',
            },
          ],
        }
      : defaultGuide;
  }

  if (hasAnyKeyword(combined, ['kimbap', 'gimbap', '김밥'])) {
    return isGerman
      ? {
          eyebrow: 'Koreanische Reisrollen',
          introTitle: 'Kimbap einfach rollen',
          intro:
            'Kimbap ist perfekt für Lunchboxen, Picknick oder Meal Prep. Entscheidend sind gut gewürzter Reis, trockene Füllungen und ein sauberes, festes Rollen.',
          shoppingTitle: 'Reis, Gim und Füllungen',
          shoppingText:
            'Kimbap-Gim und eingelegter Rettich sind im Asia-Markt am einfachsten zu finden. Für den Reis funktionieren Sushi-Reis oder Milchreis oft besser als lockerer Langkornreis.',
          tips: [
            'Den Reis warm mit Sesamöl und Salz würzen, aber vor dem Rollen leicht abkühlen lassen.',
            'Füllungen nicht zu nass machen, sonst reißt das Algenblatt.',
            'Das Messer vor dem Schneiden leicht anfeuchten oder einölen.',
          ],
          faq: [
            {
              question: 'Welcher Reis ist gut für Kimbap?',
              answer:
                'Kurzkornreis, Sushi-Reis oder notfalls Milchreis funktionieren gut, weil sie klebriger sind als Langkornreis.',
            },
            {
              question: 'Warum fällt mein Kimbap auseinander?',
              answer:
                'Oft ist zu viel Füllung oder zu nasser Reis der Grund. Rolle fester und verwende weniger Füllung.',
            },
          ],
        }
      : defaultGuide;
  }

  return defaultGuide;
};

const getRecipeFaqSchema = (faq) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

const PRIORITY_RECIPE_SLUG_KEYWORDS = [
  'kimchi',
  'tteokbokki',
  'bibimbap',
  'kimbap',
  'gimbap',
  'bulgogi',
  'japchae',
  'doenjang',
  'miyeokguk',
  'mandu',
  'tonkatsu',
  'ssamjang',
  'chogochujang',
  'gochujang',
  'salad-dressing',
  'spicy',
  'eomuk',
  'kongnamul',
];

const isPriorityRecipeSlug = (slug = '') => {
  const normalized = `${slug}`.toLowerCase();
  return PRIORITY_RECIPE_SLUG_KEYWORDS.some((keyword) =>
    normalized.includes(keyword)
  );
};

export async function getStaticPaths({ locales }) {
  try {
    const allPaths = [];

    for (const locale of locales) {
      const mappedLocale = locale === 'de' ? 'de' : 'en';

      const res = await client.getEntries({
        content_type: 'recipe',
        select: 'fields.slug',
        locale: mappedLocale,
        include: 0,
        limit: 1000,
      });

      const localePaths = res.items
        .filter((item) => item.fields.slug)
        .filter((item) => isPriorityRecipeSlug(item.fields.slug))
        .map((item) => ({
          params: { slug: item.fields.slug.toLowerCase() },
          locale,
        }));

      allPaths.push(...localePaths);
    }

    return {
      paths: allPaths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching recipe slugs:', error);
    return {
      paths: [],
      fallback: 'blocking',
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
      seoTitle: recipeEntry.fields.seoTitle || null,
      seoDescription: recipeEntry.fields.seoDescription || null,
      updatedDate:
        recipeEntry.fields.updatedDate || recipeEntry.sys.updatedAt || null,
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
    seoTitle: null,
    seoDescription: null,
    updatedDate: null,
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
    seoTitle,
    seoDescription,
    updatedDate,
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
    const fromSeoDescription = stripHtmlLikeWhitespace(seoDescription);
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

    return truncateText(
      fromSeoDescription || fromDescription || fromInstructions || generated,
      160
    );
  }, [
    seoDescription,
    description,
    instructions,
    titel,
    category,
    preparationTime,
    servings,
    mappedLocale,
  ]);

  const fallbackPageTitle =
    mappedLocale === 'de'
      ? `${titel || 'Rezept'} Rezept | ${category || 'Korean Food'} | Hansik Young`
      : `${titel || 'Recipe'} Recipe | ${category || 'Korean Food'} | Hansik Young`;

  const pageTitle = seoTitle
    ? `${stripHtmlLikeWhitespace(seoTitle)} | Hansik Young`
    : fallbackPageTitle;

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

  const guide = getRecipeGuide({
    title: titel,
    slug: safeRecipe.slug,
    ingredients,
    mappedLocale,
  });

  const faqSchema = getRecipeFaqSchema(guide.faq);

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
    dateModified: updatedDate || undefined,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
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

        <section className={styles.recipeGuideIntro}>
          <p className={styles.guideEyebrow}>{guide.eyebrow}</p>
          <h2>{guide.introTitle}</h2>
          <p>{guide.intro}</p>
        </section>

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

            <section className={styles.practicalInfoGrid}>
              <article className={styles.practicalInfoCard}>
                <h3>{guide.shoppingTitle}</h3>
                <p>{guide.shoppingText}</p>
              </article>
              <article className={styles.practicalInfoCard}>
                <h3>{mappedLocale === 'de' ? 'Kleine Tipps' : 'Quick tips'}</h3>
                <ul>
                  {guide.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </article>
            </section>

            {steps && steps.length > 0 ? (
              <>
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

                {instructions && (
                  <div className={styles.instructions}>
                    <h3>
                      {mappedLocale === 'de'
                        ? 'Varianten und Hinweise'
                        : 'Variations and notes'}
                    </h3>
                    {renderContent(instructions)}
                  </div>
                )}
              </>
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

        {guide.faq.length > 0 && (
          <section className={styles.recipeFaqSection}>
            <h2>
              {mappedLocale === 'de'
                ? 'Häufige Fragen zum Rezept'
                : 'Recipe FAQ'}
            </h2>
            <div className={styles.recipeFaqList}>
              {guide.faq.map((item) => (
                <article key={item.question} className={styles.recipeFaqItem}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
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
