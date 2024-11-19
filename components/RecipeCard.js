// components/RecipeCard.js
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/RecipeCard.module.css';
import { getYouTubeThumbnail } from '../lib/getYouTubeThumbnail';

const RecipeCard = ({ recipe }) => {
  const [thumbnail, setThumbnail] = useState('/images/default.png'); // 기본 이미지 설정

  useEffect(() => {
    const fetchThumbnail = () => {
      if (recipe.image && recipe.image !== '/images/default.png') {
        // 이미 등록된 이미지가 있는 경우
        setThumbnail(
          recipe.image.startsWith('//') ? `https:${recipe.image}` : recipe.image
        );
      } else if (recipe.youTubeUrl) {
        // 유튜브 썸네일이 있는 경우
        const ytThumbnail = getYouTubeThumbnail(recipe.youTubeUrl);
        setThumbnail(ytThumbnail || '/images/default.png');
      } else {
        // 기본 이미지 사용
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
          alt={`${titel} Thumbnail`}
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
