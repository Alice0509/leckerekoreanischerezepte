import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import recipeFreshness from '../lib/recipeFreshness.cjs';
const { isNewRecipe } = recipeFreshness;
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/RecipeCard.module.css';
import { getYouTubeThumbnail } from '../lib/getYouTubeThumbnail';

const getRecipeThumbnail = (recipe) => {
  if (recipe.image && recipe.image !== '/images/default.png') {
    return recipe.image.startsWith('//')
      ? `https:${recipe.image}`
      : recipe.image;
  }

  if (recipe.youTubeUrl) {
    return getYouTubeThumbnail(recipe.youTubeUrl) || '/images/default.png';
  }

  return '/images/default.png';
};

const RecipeCard = ({
  recipe,
  locale,
  freshnessCheckedAt,
  recommended = false,
  showDescription = false,
  headingLevel = 2,
  priority = false,
}) => {
  const router = useRouter();
  const activeLocale = locale || router.locale || 'en';
  const [checkedAt, setCheckedAt] = useState(freshnessCheckedAt);

  useEffect(() => {
    const refresh = () => setCheckedAt(Date.now());
    refresh();
    // Expiry does not require a daily build, including on a long-open page.
    const interval = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  const [thumbnail, setThumbnail] = useState(() => getRecipeThumbnail(recipe));

  useEffect(() => {
    setThumbnail(getRecipeThumbnail(recipe));
  }, [recipe]);

  const titel = recipe.titel || recipe.title || 'Untitled recipe';
  const Title = headingLevel === 3 ? 'h3' : 'h2';

  return (
    <article className={styles.card}>
      <Link href={`/recipes/${recipe.slug}`} className={styles.link}>
        <div className={styles.imageWrap}>
          {(recommended || isNewRecipe(recipe.firstPublishedAt, checkedAt)) && (
            <span
              className={styles.newBadge}
              aria-label={
                recommended
                  ? activeLocale === 'de'
                    ? 'Wochenempfehlung'
                    : 'This week’s recommended recipe'
                  : activeLocale === 'de'
                    ? 'Neues Rezept'
                    : 'New recipe'
              }
            >
              {recommended
                ? activeLocale === 'de'
                  ? 'EMPFEHLUNG'
                  : 'WEEKLY PICK'
                : activeLocale === 'de'
                  ? 'NEU'
                  : 'NEW'}
            </span>
          )}
          <Image
            src={thumbnail}
            alt={titel}
            width={600}
            height={600}
            className={styles.image}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px"
            priority={priority}
          />
        </div>

        <div className={styles.content}>
          {typeof recipe.category === 'string' && recipe.category && (
            <p className={styles.category}>{recipe.category}</p>
          )}
          <Title className={styles.title}>{titel}</Title>
          {showDescription && recipe.descriptionText && (
            <p className={styles.description}>{recipe.descriptionText}</p>
          )}
          <span className={styles.readRecipe} aria-hidden="true">
            {activeLocale === 'de' ? 'Zum Rezept' : 'View recipe'}{' '}
            <span>→</span>
          </span>
        </div>
      </Link>
    </article>
  );
};

export default RecipeCard;
