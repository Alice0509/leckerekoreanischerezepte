// components/RecipeCard.js
import React from 'react';
import Image from 'next/image';
import styles from '../styles/RecipeCard.module.css';
import Link from 'next/link';

const RecipeCard = ({ recipe }) => {
  const titel = recipe.titel || recipe.title;

  const imageUrl = recipe.image?.fields?.file?.url
    ? `https:${recipe.image.fields.file.url}`
    : '/images/default.png';

  return (
    <div className={styles.card}>
      <Link href={`/recipes/${recipe.slug}`} className={styles.link}>
        <Image
          src={imageUrl}
          alt={titel}
          width={300}
          height={200}
          className={styles.image}
          placeholder="blur"
          blurDataURL="/images/default.png"
        />
        <h2>{titel}</h2>
      </Link>
    </div>
  );
};

export default RecipeCard;
