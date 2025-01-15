import React from 'react';
import { NextSeo, ArticleJsonLd } from 'next-seo';
import Image from 'next/image';
import styles from '../styles/AboutUs.module.css';
import { useRouter } from 'next/router';

const AboutUs = () => {
  const router = useRouter();
  const { locale } = router;
  const mappedLocale = locale === 'de' ? 'de-DE' : 'en-US';

  // 로케일별 콘텐츠 정의
  const content = {
    'en-US': {
      title: 'About Us | Leckere Koreanische Rezepte',
      description:
        'Learn more about us and our mission to make authentic Korean cuisine accessible in Germany.',
      sections: [
        {
          heading: 'About Us',
          paragraph: (
            <p className={styles.intro}>
              Welcome to our <strong>leckere-koreanische-rezepte.de</strong>! We
              are passionate chefs and lovers of Korean cuisine, dedicated to
              sharing authentic Korean recipes using ingredients that are easily
              accessible in Germany.
            </p>
          ),
        },
        {
          heading: 'About Me',
          paragraph: (
            <>
              {/* Joan 이미지 추가 */}
              <div className={styles.profileImage}>
                <Image
                  src="/images/my_joan.png"
                  alt="Joan"
                  width={150}
                  height={150}
                />
              </div>
              Hello, I am Joan, a Korean living in Germany. First of all, thank
              you for visiting my website. I used to think that the time I spend
              cooking was wasted, but when I lived in Germany, my surroundings
              often talked about dishes that my child had eaten in Korea and
              wished for. This led me to constantly search for and research
              recipes. There are still many dishes where I fail.
            </>
          ),
        },
        {
          heading: 'Why This Website?',
          paragraph:
            'The reason I created this website is so that my child can request my dishes in the future and I want them to remember the recipes I used. This means that only the dishes where my child gives a &quot;thumbs up&quot; and asks for the recipe will be published here.',
        },
        {
          heading: 'Korean Cuisine in Germany',
          paragraph:
            'In Korea, like in many other countries, there are thousands of recipes. These recipes are the ones highly praised by my child. In Germany, there are many ingredients to prepare Korean dishes, but sometimes there are also ingredients that can only be found in Korea. This is the second reason why I decided to start this site – I want to introduce the ingredients I have found that are suitable for Korean cuisine.',
        },
        {
          heading: 'Contact Me',
          paragraph: (
            <>
              I am happy to assist you with any questions and suggestions. Do
              not hesitate to contact me via email:{' '}
              <a
                href="mailto:joan.korean.rezepte@gmail.com"
                aria-label="Contact me via email"
              >
                joan.korean.rezepte@gmail.com
              </a>
            </>
          ),
        },
      ],
    },
    'de-DE': {
      title: 'Über Uns | Leckere Koreanische Rezepte',
      description:
        'Erfahren Sie mehr über uns und unsere Mission, authentische koreanische Küche in Deutschland zugänglich zu machen.',

      sections: [
        {
          heading: 'Über Uns',
          paragraph: (
            <p className={styles.intro}>
              Willkommen bei <strong>leckere-koreanische-rezepte.de</strong>!
              Hier finden Sie authentische koreanische Rezepte, die mit viel
              Liebe und Sorgfalt ausgewählt wurden, um Ihnen die echte
              koreanische Küche näherzubringen.
            </p>
          ),
        },
        {
          heading: 'Über Mich',
          paragraph: (
            <>
              {/* Joan 이미지 추가 */}
              <div className={styles.profileImage}>
                <Image
                  src="/images/my_joan.png"
                  alt="Joan"
                  width={150}
                  height={150}
                />
              </div>
              Hallo, ich bin Joan, eine Koreanerin, die in Deutschland lebt.
              Zunächst einmal danke ich Ihnen, dass Sie meine Webseite besuchen.
              Früher dachte ich, dass die Zeit, die ich mit Kochen verbringe,
              verschwendet ist, aber als ich in Deutschland lebte, sprach mein
              Umfeld oft über Gerichte, die mein Kind in Korea gegessen hatte
              und die es sich wünschte. Das hat mich dazu gebracht, ständig nach
              Rezepten zu suchen und zu forschen. Es gibt immer noch viele
              Gerichte, bei denen ich scheitere.
            </>
          ),
        },
        {
          heading: 'Warum Diese Webseite?',
          paragraph: (
            <>
              Der Grund, warum ich diese Webseite erstellt habe, ist, dass mein
              Kind in Zukunft nach meinen Gerichten verlangen kann und ich
              möchte, dass es sich an die Rezepte erinnert, die ich verwendet
              habe. Das bedeutet, dass nur die Gerichte, bei denen mein Kind
              &quot;Daumen hoch&quot; gibt und nach dem Rezept fragt, hier
              veröffentlicht werden.
            </>
          ),
        },
        {
          heading: 'Koreanische Küche in Deutschland',
          paragraph: (
            <>
              In Korea gibt es, wie in vielen anderen Ländern, tausende von
              Rezepten. Diese Rezepte sind diejenigen, die von meinem Kind sehr
              gelobt werden. In Deutschland gibt es viele Zutaten, um
              koreanische Gerichte zuzubereiten, aber manchmal gibt es auch
              Zutaten, die nur in Korea zu finden sind. Das ist der zweite
              Grund, warum ich mich entschieden habe, diese Seite zu eröffnen –
              ich möchte die Zutaten vorstellen, die ich gefunden habe und die
              für die koreanische Küche geeignet sind.
            </>
          ),
        },
        {
          heading: 'Kontaktieren Sie Mich',
          paragraph: (
            <>
              Ich stehe Ihnen gerne für Fragen und Anregungen zur Verfügung.
              Zögern Sie nicht, mich per E-Mail zu kontaktieren:{' '}
              <a
                href="mailto:joan.korean.rezepte@gmail.com"
                aria-label="Contact me via email"
              >
                joan.korean.rezepte@gmail.com
              </a>
            </>
          ),
        },
      ],
    },
  };

  const currentContent = content[mappedLocale] || content['en-US'];

  return (
    <>
      <NextSeo
        title={currentContent.title}
        description={currentContent.description}
        openGraph={{
          url: 'https://www.leckere-koreanische-rezepte.de/about-us',
          title: currentContent.title,
          description: currentContent.description,
          images: [
            {
              url: '/images/about-us-og-image.png',
              width: 800,
              height: 600,
              alt: currentContent.title,
            },
          ],
          site_name: 'Leckere Koreanische Rezepte',
        }}
      />

      <ArticleJsonLd
        url="https://www.leckere-koreanische-rezepte.de/about-us"
        title={currentContent.title}
        images={[
          'https://www.leckere-koreanische-rezepte.de/images/about-us-og-image.png',
        ]}
        datePublished="2024-01-01T12:00:00Z"
        authorName="Joan"
        publisherName="Leckere Koreanische Rezepte"
        publisherLogo="https://www.leckere-koreanische-rezepte.de/images/logo.png"
        description={currentContent.description}
      />

      <div className={styles.container}>
        <h1>{currentContent.heading}</h1>
        {currentContent.sections.map((section, index) => (
          <div key={index} className={styles.section}>
            <h2>{section.heading}</h2>
            {/* paragraph가 문자열이나 JSX일 수 있으므로 이를 그대로 렌더 */}
            <div>{section.paragraph}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AboutUs;
