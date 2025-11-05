// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// ───────────────────────────────────────────────────────────
// PWA 설정
//  - dev 환경(disable) : true → 서비스워커 미등록
//  - prod/preview      : false → 서비스워커 등록 + 캐싱
//  - runtimeCaching    : Unsplash·Instagram 이미지 CacheFirst
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
        // 🔹 Unsplash 원본 도메인 추가
        { protocol: 'https', hostname: 'images.unsplash.com' },
        // 🔹 Instagram CDN(릴스·썸네일) 추가 (옵셔널)
        { protocol: 'https', hostname: 'scontent.cdninstagram.com' },
      ],
    },
    experimental: {
      largePageDataBytes: 150 * 1024, // 150 KB
    },
    reactStrictMode: true,
  })
);
