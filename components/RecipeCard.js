import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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

const RecipeCard = ({ recipe }) => {
  const [thumbnail, setThumbnail] = useState(() => getRecipeThumbnail(recipe));

  useEffect(() => {
    setThumbnail(getRecipeThumbnail(recipe));
  }, [recipe]);

  const titel = recipe.titel || recipe.title || 'Untitled recipe';

  return (
    <article className={styles.card}>
      <Link href={`/recipes/${recipe.slug}`} className={styles.link}>
        <div className={styles.imageWrap}>
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
