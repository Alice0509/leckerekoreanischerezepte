// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

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
        expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^https:\/\/scontent\.cdninstagram\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'instagram-images',
        expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
  ],
});

module.exports = withPWA(
  withBundleAnalyzer({
    i18n: {
      locales: ['de', 'en'],
      defaultLocale: 'en',
    },

    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'images.ctfassets.net' },
        { protocol: 'https', hostname: 'img.youtube.com' },
        { protocol: 'https', hostname: 'images.unsplash.com' },
        { protocol: 'https', hostname: 'scontent.cdninstagram.com' },
      ],
    },

    experimental: {
      largePageDataBytes: 150 * 1024,
    },

    reactStrictMode: true,

    async redirects() {
      return [
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'hansikyoung.de' }],
          destination: 'https://www.leckere-koreanische-rezepte.de/:path*',
          permanent: true,
        },
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'www.hansikyoung.de' }],
          destination: 'https://www.leckere-koreanische-rezepte.de/:path*',
          permanent: true,
        },
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'hansikyoung.com' }],
          destination: 'https://www.leckere-koreanische-rezepte.de/:path*',
          permanent: true,
        },
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'www.hansikyoung.com' }],
          destination: 'https://www.leckere-koreanische-rezepte.de/:path*',
          permanent: true,
        },
      ];
    },
  })
);
