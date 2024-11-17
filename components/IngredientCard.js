// components/IngredientCard.js
import React from 'react';
import Image from 'next/image';
import styles from '../styles/IngredientCard.module.css';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

// 예시: Base64 인코딩된 로딩 스피너
const loadingSpinner =
  'data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAACH5BAEAAAEALAAAAAAQABAAAAIgjI+py+0Po5y02ouzPgUAOw==';

const IngredientCard = ({ ingredient }) => {
  const { name, germanMeatCut, bild, description } = ingredient;

  // description이 없는 재료는 표시하지 않음
  if (!description) {
    return null;
  }

  return (
    <div className={styles.card}>
      {/* 이미지 Wrapper */}
      <div className={styles.imageWrapper}>
        {bild ? (
          <Image
            src={bild}
            alt={`${name} 이미지`}
            width={300}
            height={200}
            className={styles.image}
            placeholder="blur"
            blurDataURL={loadingSpinner}
          />
        ) : (
          <Image
            src="/images/default.png" // public/images 폴더에 기본 이미지 추가
            alt="기본 이미지"
            width={300}
            height={200}
            className={styles.image}
            placeholder="blur"
            blurDataURL={loadingSpinner}
          />
        )}
      </div>
      {/* 내용 Wrapper */}
      <div className={styles.content}>
        <h2 className={styles.title}>{name}</h2>
        {germanMeatCut && <p className={styles.meatCut}>부위: {germanMeatCut}</p>}
        <div className={styles.description}>
          {typeof description === 'object'
            ? documentToReactComponents(description)
            : description}
        </div>
      </div>
    </div>
  );
};

export default IngredientCard;
