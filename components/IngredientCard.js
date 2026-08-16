import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { isPriorityIngredientSlug } from '../lib/ingredientDetailRoutes';
import styles from '../styles/IngredientCard.module.css';

const IngredientCard = ({ ingredient }) => {
  const router = useRouter();
  const isGerman = router.locale === 'de';
  const { name, slug, germanMeatCut, bild, description } = ingredient;

  // 설명 없는 재료는 카드 목록에 노출하지 않음
  if (!description) return null;

  const plainText =
    typeof description === 'string'
      ? description
      : description?.content
          ?.map((block) =>
            block.content?.map((node) => node.value || '').join('')
          )
          .join(' ') || '';

  const shortDesc =
    plainText.length > 120 ? plainText.slice(0, 120) + '...' : plainText;

  // 제목을 메인 / 보조 제목으로 분리
  const match = name?.match(/^([^(]+)\((.+)\)$/);
  const mainTitle = match ? match[1].trim() : name;
  const subTitle = match ? match[2].trim() : '';

  const hasDetailPage = isPriorityIngredientSlug(slug);

  const content = (
    <>
      <div className={styles.imageWrapper}>
        <Image
          src={bild || '/images/default.png'}
          alt={`${name} Image`}
          fill
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{mainTitle}</h2>

        {subTitle && <p className={styles.subtitle}>{subTitle}</p>}

        {germanMeatCut && (
          <p className={styles.meatCut}>
            {isGerman ? 'Stück:' : 'Cut:'} {germanMeatCut}
          </p>
        )}

        <p className={styles.preview}>{shortDesc}</p>
      </div>
    </>
  );

  if (!hasDetailPage) {
    return (
      <article className={`${styles.card} ${styles.staticCard}`}>
        {content}
      </article>
    );
  }

  return (
    <Link href={`/ingredients/${slug}`} className={styles.card}>
      {content}
    </Link>
  );
};

export default IngredientCard;
