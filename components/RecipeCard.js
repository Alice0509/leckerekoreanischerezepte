import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/RecipeCard.module.css';
import { getYouTubeThumbnail } from '../lib/getYouTubeThumbnail';

const RecipeCard = ({ recipe }) => {
  const [thumbnail, setThumbnail] = useState('/images/default.png');

  useEffect(() => {
    if (recipe.image && recipe.image !== '/images/default.png') {
      setThumbnail(
        recipe.image.startsWith('//') ? `https:${recipe.image}` : recipe.image
      );
    } else if (recipe.youTubeUrl) {
      const ytThumbnail = getYouTubeThumbnail(recipe.youTubeUrl);
      setThumbnail(ytThumbnail || '/images/default.png');
    }
  }, [recipe]);

  const titel = recipe.titel || recipe.title;

  return (
    <div className={styles.card}>
      <Link href={`/recipes/${recipe.slug}`} className={styles.link}>
        <Image
          src={thumbnail}
          alt={`${titel} Thumbnail`}
          width={600}
          height={600}
          className={styles.image}
          priority={false}
        />

        <h2>{titel}</h2>
      </Link>
    </div>
  );
};

export default RecipeCard;
