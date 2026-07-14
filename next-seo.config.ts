// next-seo.config.ts
import { DefaultSeoProps } from 'next-seo';

const SEO: DefaultSeoProps = {
  title: 'Hansik Young',
  description:
    'Einfache koreanische Hausmannskost mit Zutaten, die du in Deutschland findest: Rezepte, Zutaten-Tipps und Küchenbasics.',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://www.leckere-koreanische-rezepte.de/',
    site_name: 'Hansik Young',
    images: [
      {
        url: '/images/default.png',
        width: 800,
        height: 600,
        alt: 'Hansik Young',
      },
    ],
  },
  twitter: {
    handle: '@yourhandle',
    site: '@yoursite',
    cardType: 'summary_large_image',
  },
};

export default SEO;
