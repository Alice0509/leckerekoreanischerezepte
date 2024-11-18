// components/RecipeCard.js
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../styles/RecipeCard.module.css';
import Link from 'next/link';
import { getYouTubeThumbnail } from '../lib/getYouTubeThumbnail';

const RecipeCard = ({ recipe }) => {
  const [thumbnail, setThumbnail] = useState('/images/default.png'); // 기본 이미지 설정

  useEffect(() => {
    const fetchThumbnail = () => {
      if (recipe.image?.fields?.file?.url) {
        console.log('Using image from recipe:', recipe.image.fields.file.url);
        setThumbnail(`https:${recipe.image.fields.file.url}`);
      } else if (recipe.youTubeUrl) {
        const ytThumbnail = getYouTubeThumbnail(recipe.youTubeUrl);
        console.log('Using YouTube thumbnail:', ytThumbnail);
        setThumbnail(ytThumbnail || '/images/default.png');
      } else {
        console.log('Using default thumbnail');
        setThumbnail('/images/default.png');
      }
    };

    fetchThumbnail();
  }, [recipe]);

  const titel = recipe.titel || recipe.title;

  return (
    <div className={styles.card}>
      <Link href={`/recipes/${recipe.slug}`} className={styles.link}>
        <Image
          src={thumbnail}
          alt={titel}
          width={300}
          height={200}
          className={styles.image}
          placeholder="blur"
          blurDataURL="/images/default.png" // 블러링을 위한 기본 이미지
        />
        <h2>{titel}</h2>
      </Link>
    </div>
  );
};

export default RecipeCard;
