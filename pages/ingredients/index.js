// pages/ingredients/index.js

import React from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import client from '../../lib/contentful';
import IngredientCard from '../../components/IngredientCard';
import styles from '../../styles/Ingredients.module.css';

// 로케일별 재료 목록을 저장할 메모리 캐시 객체
const ingredientsCache = {};

const starterKeywords = [
  'gochujang',
  '고추장',
  'gochugaru',
  '고춧가루',
  'kimchi',
  '김치',
  'doenjang',
  '된장',
  'soy',
  'sojas',
  '간장',
  'sesame',
  'sesam',
  '참기름',
  'rice',
  'reis',
  '쌀',
  'gim',
  '김',
  'dangmyeon',
  '당면',
];

const getPlainText = (description) => {
  if (!description) return '';

  if (typeof description === 'string') return description;

  return (
    description?.content
      ?.map((block) => block.content?.map((node) => node.value || '').join(''))
      .join(' ') || ''
  );
};

const isStarterIngredient = (ingredient) => {
  const haystack =
    `${ingredient.name || ''} ${ingredient.slug || ''}`.toLowerCase();
  return starterKeywords.some((keyword) =>
    haystack.includes(keyword.toLowerCase())
  );
};

export async function getStaticProps({ locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en';

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
      limit: 1000,
    });

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

    const ingredients = res.items.map((item) => {
      const imageAsset = item.fields.bild?.sys?.id
        ? assetsMap[item.fields.bild.sys.id]
        : null;
      const imageUrl = imageAsset
        ? `https:${imageAsset.fields.file.url}`
        : null;

      return {
        id: item.sys.id,
        name: item.fields.name || '',
        slug: item.fields.slug || '',
        germanMeatCut: item.fields.germanMeatCut || null,
        bild: imageUrl,
        description: item.fields.description || null,
      };
    });

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
        mappedLocale: locale === 'de' ? 'de' : 'en',
      },
      revalidate: 60,
    };
  }
}

const Ingredients = ({ ingredients, error, mappedLocale }) => {
  const isGerman = mappedLocale === 'de';
  const visibleIngredients = ingredients?.filter((ingredient) =>
    getPlainText(ingredient.description)
  );
  const starterIngredients = visibleIngredients
    ?.filter(isStarterIngredient)
    .slice(0, 8);

  const seoTitle = isGerman
    ? 'Koreanische Zutaten in Deutschland kaufen | Leckere Koreanische Rezepte'
    : 'Korean Ingredients in Germany | Leckere Koreanische Rezepte';

  const seoDescription = isGerman
    ? 'Ein praktischer Guide für koreanische Zutaten in Deutschland: Gochujang, Kimchi, Reis, Sesamöl, Doenjang und mehr – mit Tipps zum Kaufen, Ersetzen und Kochen.'
    : 'A practical guide to Korean ingredients in Germany: gochujang, kimchi, rice, sesame oil, doenjang and more, with buying, substitution and cooking tips.';

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!visibleIngredients || visibleIngredients.length === 0) {
    return (
      <div className={styles.noIngredients}>
        {isGerman ? 'Keine Zutaten verfügbar.' : 'No ingredients available.'}
      </div>
    );
  }

  return (
    <>
      <NextSeo title={seoTitle} description={seoDescription} />

      <main className={styles.container}>
        <section className={styles.hero}>
          <p className={styles.kicker}>
            {isGerman ? 'Zutaten-Guide' : 'Ingredient guide'}
          </p>
          <h1>
            {isGerman
              ? 'Koreanische Zutaten in Deutschland kaufen und richtig verwenden'
              : 'Korean ingredients in Germany: what to buy and how to use them'}
          </h1>
          <p className={styles.heroText}>
            {isGerman
              ? 'Hier findest du koreanische Grundzutaten, ehrliche Einkaufstipps und einfache Erklärungen für die Küche in Deutschland – von Gochujang und Kimchi bis Reis, Sesamöl und Doenjang.'
              : 'Find the Korean pantry basics I use in Germany, with practical shopping tips, substitutions and recipe ideas for everyday Korean cooking.'}
          </p>
        </section>

        <section
          className={styles.introGrid}
          aria-label={isGerman ? 'Womit anfangen' : 'Where to start'}
        >
          <article className={styles.introCard}>
            <span>01</span>
            <h2>{isGerman ? 'Starte mit Basics' : 'Start with the basics'}</h2>
            <p>
              {isGerman
                ? 'Gochujang, Sojasauce, Sesamöl, Reis und Kimchi reichen oft schon für viele einfache koreanische Gerichte.'
                : 'Gochujang, soy sauce, sesame oil, rice and kimchi are enough for many simple Korean meals.'}
            </p>
          </article>
          <article className={styles.introCard}>
            <span>02</span>
            <h2>{isGerman ? 'Kaufe realistisch ein' : 'Shop realistically'}</h2>
            <p>
              {isGerman
                ? 'Viele Zutaten findest du im Asia-Markt oder online. Für Gemüse, Reis und Basics funktionieren oft auch REWE, Edeka, Lidl oder Alnatura.'
                : 'Many ingredients are easiest at Asian supermarkets or online, while vegetables, rice and pantry basics often work from regular German supermarkets.'}
            </p>
          </article>
          <article className={styles.introCard}>
            <span>03</span>
            <h2>{isGerman ? 'Ersetze mit Gefühl' : 'Substitute carefully'}</h2>
            <p>
              {isGerman
                ? 'Nicht jede Zutat lässt sich perfekt ersetzen. Ich zeige dir, was funktioniert, was anders schmeckt und wann sich das Original lohnt.'
                : 'Not every ingredient can be replaced perfectly. These guides explain what works, what tastes different and when the original is worth buying.'}
            </p>
          </article>
        </section>

        {starterIngredients.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <p className={styles.kicker}>
                {isGerman ? 'Für den Anfang' : 'For beginners'}
              </p>
              <h2>
                {isGerman
                  ? 'Die wichtigsten koreanischen Zutaten'
                  : 'The most useful Korean ingredients'}
              </h2>
              <p>
                {isGerman
                  ? 'Diese Zutaten sind besonders praktisch, wenn du regelmäßig koreanisch kochen möchtest.'
                  : 'These are the ingredients that help most when you want to cook Korean food regularly.'}
              </p>
            </div>
            <div className={styles.grid}>
              {starterIngredients.map((ingredient) => (
                <IngredientCard key={ingredient.id} ingredient={ingredient} />
              ))}
            </div>
          </section>
        )}

        <section className={styles.shoppingSection}>
          <div>
            <p className={styles.kicker}>
              {isGerman ? 'Einkaufen in Deutschland' : 'Shopping in Germany'}
            </p>
            <h2>
              {isGerman
                ? 'Wo kauft man koreanische Zutaten?'
                : 'Where to buy Korean ingredients'}
            </h2>
          </div>
          <div className={styles.shoppingGrid}>
            <div>
              <h3>Asia-Markt</h3>
              <p>
                {isGerman
                  ? 'Am besten für Gochujang, Doenjang, Gochugaru, Kimchi, Reiskuchen, Fischkuchen und getrocknete Zutaten.'
                  : 'Best for gochujang, doenjang, gochugaru, kimchi, rice cakes, fish cakes and dried pantry ingredients.'}
              </p>
            </div>
            <div>
              <h3>REWE / Edeka / Lidl</h3>
              <p>
                {isGerman
                  ? 'Gut für Reis, Gemüse, Tofu, Eier, Fleisch, Frühlingszwiebeln und einfache Ersatzprodukte.'
                  : 'Useful for rice, vegetables, tofu, eggs, meat, spring onions and simple substitutes.'}
              </p>
            </div>
            <div>
              <h3>Online</h3>
              <p>
                {isGerman
                  ? 'Praktisch für Markenprodukte, größere Packungen und Zutaten, die du nicht regelmäßig im Laden findest.'
                  : 'Helpful for specific brands, larger packs and ingredients you cannot easily find locally.'}
              </p>
            </div>
          </div>
        </section>

        <section className={styles.shoppingListCta}>
          <div>
            <p className={styles.kicker}>
              {isGerman ? 'Meine Favoriten' : 'My favorites'}
            </p>
            <h2>
              {isGerman
                ? 'Du möchtest sehen, was ich selbst nutze?'
                : 'Want to see what I actually use?'}
            </h2>
            <p>
              {isGerman
                ? 'In meinen Favoriten sammle ich Zutaten, Produkte und Küchenbasics, die ich selbst kaufe oder im Alltag benutze.'
                : 'In my favorites, I collect ingredients, products, and kitchen basics I buy myself or use in everyday cooking.'}
            </p>
          </div>
          <Link href="/gallery" className={styles.ctaButton}>
            {isGerman ? 'Favoriten ansehen' : 'View favorites'}
          </Link>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.kicker}>
              {isGerman ? 'Alle Zutaten' : 'All ingredients'}
            </p>
            <h2>
              {isGerman
                ? 'Koreanische Zutaten und praktische Alternativen'
                : 'Korean ingredients and practical alternatives'}
            </h2>
            <p>
              {isGerman
                ? 'Stöbere durch alle Zutaten, die ich in meinen Rezepten verwende.'
                : 'Browse the ingredients I use in my recipes.'}
            </p>
          </div>
          <div className={styles.grid}>
            {visibleIngredients.map((ingredient) => (
              <IngredientCard key={ingredient.id} ingredient={ingredient} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default Ingredients;
