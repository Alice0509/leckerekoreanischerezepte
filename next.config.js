// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

let localizedRouteData = {
  recipesById: {},
};

try {
  localizedRouteData = require('./lib/generated-localized-routes.json');
} catch (error) {
  console.warn(
    'Localized route data is not available yet. Run the SEO asset generator.'
  );
}

const isSafeRecipeSlug = (value) =>
  typeof value === 'string' && /^[a-z0-9][a-z0-9-]*$/i.test(value);

const getLocalizedRecipeRedirects = () =>
  Object.values(localizedRouteData.recipesById || {}).flatMap((recipe) => {
    const deSlug = recipe.de;
    const enSlug = recipe.en;

    if (
      !isSafeRecipeSlug(deSlug) ||
      !isSafeRecipeSlug(enSlug) ||
      deSlug === enSlug
    ) {
      return [];
    }

    return [
      {
        // 독일 도메인에서 영어 slug로 접근한 경우
        // locale:false이므로 실제 matcher에는 /de prefix가 필요하다.
        source: `/de/recipes/${enSlug}`,
        has: [
          {
            type: 'host',
            value: 'www.leckere-koreanische-rezepte.de',
          },
        ],
        destination: `https://www.leckere-koreanische-rezepte.de/recipes/${deSlug}`,
        permanent: true,
        locale: false,
      },
      {
        // 영어 도메인에서 독일어 slug로 접근한 경우
        source: `/en/recipes/${deSlug}`,
        has: [
          {
            type: 'host',
            value: 'www.hansikyoung.com',
          },
        ],
        destination: `https://www.hansikyoung.com/recipes/${enSlug}`,
        permanent: true,
        locale: false,
      },
    ];
  });

const getLocalePrefixRedirects = () => {
  const canonicalHosts = {
    de: 'www.leckere-koreanische-rezepte.de',
    en: 'www.hansikyoung.com',
  };

  const sourceHosts = [
    'www.leckere-koreanische-rezepte.de',
    'leckere-koreanische-rezepte.de',
    'www.hansikyoung.com',
    'hansikyoung.com',
    'www.hansikyoung.de',
    'hansikyoung.de',
  ];

  const createRedirects = ({ host, locale, destinationHost }) => [
    {
      source: `/${locale}`,
      has: [
        {
          type: 'host',
          value: host,
        },
      ],
      destination: `https://${destinationHost}`,
      permanent: true,
      locale: false,
    },
    {
      source: `/${locale}/:path*`,
      has: [
        {
          type: 'host',
          value: host,
        },
      ],
      destination: `https://${destinationHost}/:path*`,
      permanent: true,
      locale: false,
    },
  ];

  return sourceHosts.flatMap((host) => [
    ...createRedirects({
      host,
      locale: 'de',
      destinationHost: canonicalHosts.de,
    }),
    ...createRedirects({
      host,
      locale: 'en',
      destinationHost: canonicalHosts.en,
    }),
  ]);
};

// ───────────────────────────────────────────────────────────
// PWA 설정
// ───────────────────────────────────────────────────────────
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'unsplash-images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /^https:\/\/scontent\.cdninstagram\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'instagram-images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
  ],
});

module.exports = withPWA(
  withBundleAnalyzer({
    i18n: {
      locales: ['de', 'en'],
      defaultLocale: 'en',
      localeDetection: false,
      domains: [
        {
          domain: 'www.hansikyoung.com',
          defaultLocale: 'en',
        },
        {
          domain: 'www.leckere-koreanische-rezepte.de',
          defaultLocale: 'de',
        },
      ],
    },

    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.ctfassets.net',
        },
        {
          protocol: 'https',
          hostname: 'img.youtube.com',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
        {
          protocol: 'https',
          hostname: 'scontent.cdninstagram.com',
        },
      ],
    },

    experimental: {
      largePageDataBytes: 150 * 1024,
    },

    reactStrictMode: true,

    async rewrites() {
      return {
        beforeFiles: [
          {
            source: '/en/manifest.json',
            has: [
              {
                type: 'host',
                value: 'www.hansikyoung.com',
              },
            ],
            destination: '/en/manifest-en.json',
            locale: false,
          },
          {
            source: '/de/manifest.json',
            has: [
              {
                type: 'host',
                value: 'www.leckere-koreanische-rezepte.de',
              },
            ],
            destination: '/de/manifest-de.json',
            locale: false,
          },
          {
            source: '/en/robots.txt',
            has: [
              {
                type: 'host',
                value: 'www.hansikyoung.com',
              },
            ],
            destination: '/en/robots-en.txt',
            locale: false,
          },
          {
            source: '/de/robots.txt',
            has: [
              {
                type: 'host',
                value: 'www.leckere-koreanische-rezepte.de',
              },
            ],
            destination: '/de/robots-de.txt',
            locale: false,
          },
          {
            source: '/en/sitemap.xml',
            has: [
              {
                type: 'host',
                value: 'www.hansikyoung.com',
              },
            ],
            destination: '/en/sitemap-en.xml',
            locale: false,
          },
          {
            source: '/de/sitemap.xml',
            has: [
              {
                type: 'host',
                value: 'www.leckere-koreanische-rezepte.de',
              },
            ],
            destination: '/de/sitemap-de.xml',
            locale: false,
          },
        ],
      };
    },

    async redirects() {
      return [
        ...getLocalizedRecipeRedirects(),
        ...getLocalePrefixRedirects(),
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'hansikyoung.de',
            },
          ],
          destination: 'https://www.leckere-koreanische-rezepte.de/:path*',
          permanent: true,
          locale: false,
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'www.hansikyoung.de',
            },
          ],
          destination: 'https://www.leckere-koreanische-rezepte.de/:path*',
          permanent: true,
          locale: false,
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'hansikyoung.com',
            },
          ],
          destination: 'https://www.hansikyoung.com/:path*',
          permanent: true,
          locale: false,
        },
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'leckere-koreanische-rezepte.de',
            },
          ],
          destination: 'https://www.leckere-koreanische-rezepte.de/:path*',
          permanent: true,
          locale: false,
        },
      ];
    },
  })
);
