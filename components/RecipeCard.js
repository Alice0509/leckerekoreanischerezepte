import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import recipeFreshness from '../lib/recipeFreshness.cjs';
const { isNewRecipe } = recipeFreshness;
import Link from 'next/link';
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

const RecipeCard = ({ recipe, locale = 'en', freshnessCheckedAt }) => {
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

  return (
    <article className={styles.card}>
      <Link href={`/recipes/${recipe.slug}`} className={styles.link}>
        <div className={styles.imageWrap}>
          {isNewRecipe(recipe.firstPublishedAt, checkedAt) && (
            <span
              className={styles.newBadge}
              aria-label={locale === 'de' ? 'Neues Rezept' : 'New recipe'}
            >
              {locale === 'de' ? 'NEU' : 'NEW'}
            </span>
          )}
          <Image
            src={thumbnail}
            alt={`${titel} Thumbnail`}
            width={600}
            height={600}
            className={styles.image}
            priority={false}
          />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{titel}</h2>
        </div>
      </Link>
    </article>
  );
};

export default RecipeCard;
