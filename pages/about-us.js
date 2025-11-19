import React from 'react';
import { NextSeo, ArticleJsonLd } from 'next-seo';
import styles from '../styles/AboutUs.module.css';
import Image from 'next/image';
import { useRouter } from 'next/router';

const AboutUs = () => {
  const router = useRouter();
  const { locale } = router;
  const lang = locale === 'de' ? 'de' : 'en';

  const content = {
    en: {
      title: 'About Us | Hansik Young',
      description:
        'Hansik Young — Korean home-cooking inspired by everyday life in Germany.',
      h1: 'About Us',
      intro:
        'Korean home-cooking inspired by everyday life in Germany. Simple recipes made with familiar ingredients — warm, honest, and made at home.',
      messageTitle: 'A message to my child',
      message:
        '"I collect these recipes so that one day, if you miss my cooking, you can always find your favorite dishes again."',
      contact: 'Contact',
    },
    de: {
      title: 'Über Uns | Hansik Young',
      description:
        'Hansik Young — Koreanische Hausküche, inspiriert vom Alltag in Deutschland.',
      h1: 'Über Uns',
      intro:
        'Koreanische Hausküche – einfach, ehrlich und mit Zutaten, die man in Deutschland leicht findet.',
      messageTitle: 'Eine Nachricht an mein Kind',
      message:
        '„Ich sammle diese Rezepte, damit du eines Tages, wenn du mein Essen vermisst, deine Lieblingsgerichte wiederfinden kannst.“',
      contact: 'Kontakt',
    },
  };

  const t = content[lang];

  return (
    <>
      <NextSeo
        title={t.title}
        description={t.description}
        openGraph={{
          url: 'https://www.leckere-koreanische-rezepte.de/about-us',
          title: t.title,
          description: t.description,
          images: [
            {
              url: '/images/about-us-og-image.png',
              width: 800,
              height: 600,
            },
          ],
        }}
      />

      <ArticleJsonLd
        url="https://www.leckere-koreanische-rezepte.de/about-us"
        title={t.title}
        images={[
          'https://www.leckere-koreanische-rezepte.de/images/about-us-og-image.png',
        ]}
        authorName="Joan"
        publisherName="Hansik Young"
        publisherLogo="https://www.leckere-koreanische-rezepte.de/images/logo.png"
        description={t.description}
      />

      <div className={styles.container}>
        <h1 className={styles.title}>{t.h1}</h1>

        <div className={styles.logoWrapper}>
          <Image
            src="/images/myLogo1.png"
            alt="Hansik Young Logo"
            width={180}
            height={180}
            className={styles.logo}
          />
        </div>

        <p className={styles.intro}>{t.intro}</p>

        <div className={styles.messageBox}>
          <h2 className={styles.messageTitle}>💛 {t.messageTitle}</h2>
          <p className={styles.message}>{t.message}</p>
        </div>

        <p className={styles.contact}>
          📧 {t.contact}:{' '}
          <a href="mailto:joan.korean.rezepte@gmail.com">
            joan.korean.rezepte@gmail.com
          </a>
        </p>
      </div>
    </>
  );
};

export default AboutUs;
