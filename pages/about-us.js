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
      title: 'About Hansik Young – Korean Home Cooking in Germany',
      description:
        'Hansik Young is my personal archive of Korean home cooking in Germany, with recipes, ingredient notes, and dishes I actually cook at home.',
      h1: 'About Hansik Young',
      intro:
        'Hansik Young is my personal archive of Korean home cooking in Germany. I collect the dishes I really cook at home — everyday meals, soups, stews, side dishes, sauces, and small kitchen basics.',
      secondParagraph:
        'Because I live in Germany, I also write down which ingredients I can actually find and use here. Sometimes they come from an Asian market, sometimes from a regular supermarket, and sometimes a recipe just needs a small adjustment.',
      messageTitle: 'A note to my child',
      message:
        '“I collect these recipes so that one day, when you miss my cooking, you can find your favorite dishes again.”',
      contact: 'Contact',
    },
    de: {
      title: 'Über Hansik Young – Koreanische Hausmannskost in Deutschland',
      description:
        'Hansik Young ist ein persönliches Archiv für koreanische Hausmannskost in Deutschland – mit Rezepten, Zutaten-Notizen und Gerichten, die ich wirklich zu Hause koche.',
      h1: 'Über Hansik Young',
      intro:
        'Hansik Young ist mein persönliches Archiv für koreanische Hausmannskost in Deutschland. Ich sammle hier Gerichte, die ich zu Hause wirklich koche — Alltagsgerichte, Suppen, Eintöpfe, Beilagen, Saucen und kleine Küchenbasics.',
      secondParagraph:
        'Da ich in Deutschland lebe, schreibe ich auch auf, welche Zutaten ich hier wirklich finde und benutze. Manchmal kommen sie aus dem Asia-Markt, manchmal aus dem normalen Supermarkt, und manchmal braucht ein Rezept einfach eine kleine Anpassung.',
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
        authorName="Joan von Hansik Young"
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
