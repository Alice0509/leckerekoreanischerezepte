// next-sitemap.config.js

module.exports = {
  siteUrl: 'https://www.hansikyoung.com',
  generateRobotsTxt: true,
  autoLastmod: true,
  exclude: [
    '/de',
    '/de/*',
    '/en',
    '/en/*',
    '/page/*',
    '/datenschutzerklaerung',
    '/privacy-policy',
    '/impressum',
    '/imprint',
    '/delete-data',
    '/ingredients/*',
  ],
  alternateRefs: [
    {
      href: 'https://www.hansikyoung.com',
      hreflang: 'en',
    },
    {
      href: 'https://www.leckere-koreanische-rezepte.de',
      hreflang: 'de',
    },
    {
      href: 'https://www.hansikyoung.com',
      hreflang: 'x-default',
    },
  ],
};
