// components/IngredientCard.js
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/IngredientCard.module.css';

const IngredientCard = ({ ingredient }) => {
  const { name, slug, germanMeatCut, bild, description } = ingredient;

  if (!description) return null;

  const plainText =
    typeof description === 'string'
      ? description
      : description.content
          ?.map((block) =>
            block.content?.map((node) => node.value || '').join('')
          )
          .join('') || '';

  const shortDesc =
    plainText.length > 120 ? plainText.slice(0, 120) + '...' : plainText;

  return (
    <Link href={`/ingredients/${slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={bild || '/images/default.png'}
          alt={`${name} Image`}
          fill
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{name}</h2>

        {germanMeatCut && (
          <p className={styles.meatCut}>부위: {germanMeatCut}</p>
        )}

        <p className={styles.preview}>{shortDesc}</p>
      </div>
    </Link>
  );
};

export default IngredientCard;
