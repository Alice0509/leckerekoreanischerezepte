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
        'Hansik Young is my personal archive of Korean home cooking — recipes I truly love, cook myself, and want to leave behind for my child.',
      h1: 'About Us',
      intro:
        'Hansik Young is my personal archive of Korean home cooking. I share recipes I truly enjoy, cook myself, and want to preserve for my child and anyone who loves honest Korean food.',
      secondParagraph:
        'These are not random recipes collected for trends. They are dishes that taste like home to me — from familiar Korean classics to everyday meals, side dishes, sauces, and ingredients I actually use in Germany.',
      messageTitle: 'A message to my child',
      message:
        '"I collect these recipes so that one day, if you miss my cooking, you can always find your favorite dishes again."',
      contact: 'Contact',
    },
    de: {
      title: 'Über uns | Hansik Young',
      description:
        'Hansik Young ist mein persönliches Archiv koreanischer Hausmannskost — Rezepte, die ich selbst liebe, koche und für mein Kind bewahren möchte.',
      h1: 'Über uns',
      intro:
        'Hansik Young ist mein persönliches Archiv koreanischer Hausmannskost. Ich teile hier Rezepte, die ich selbst gerne koche, wirklich lecker finde und für mein Kind bewahren möchte.',
      secondParagraph:
        'Das sind keine zufällig gesammelten Trend-Rezepte. Es sind Gerichte, die für mich nach Zuhause schmecken – von bekannten koreanischen Klassikern bis zu kleinen Alltagsgerichten, Beilagen, Saucen und Zutaten, die ich in Deutschland wirklich benutze.',
      messageTitle: 'Eine Nachricht an mein Kind',
      message:
        '„Ich sammle diese Rezepte, damit du eines Tages, wenn du mein Essen vermisst, deine Lieblingsgerichte wiederfinden kannst.“',
      contact: 'Kontakt',
    },
  };

  const t = content[lang];
  const baseUrl = 'https://www.leckere-koreanische-rezepte.de';
  const canonicalUrl = `${baseUrl}/${lang}/about-us`;

  return (
    <>
      <NextSeo
        title={t.title}
        description={t.description}
        canonical={canonicalUrl}
        languageAlternates={[
          {
            hrefLang: 'de',
            href: `${baseUrl}/de/about-us`,
          },
          {
            hrefLang: 'en',
            href: `${baseUrl}/en/about-us`,
          },
        ]}
        openGraph={{
          url: canonicalUrl,
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
        url={canonicalUrl}
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
        <p className={styles.intro}>{t.secondParagraph}</p>

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
