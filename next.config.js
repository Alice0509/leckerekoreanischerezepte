// next.config.js

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // 개발 환경에서는 PWA 비활성화
  register: true, // 서비스 워커 자동 등록
  skipWaiting: true, // 기존 워커 대기 없이 즉시 새로 적용
  buildExcludes: [/middleware-manifest\.json$/], // Next.js 12 이상에서 발생하는 오류 방지
});

module.exports = withPWA(
  withBundleAnalyzer({
    i18n: {
      locales: ['de', 'en'],
      defaultLocale: 'en',
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
      ],
    },
    experimental: {
      largePageDataBytes: 150 * 1024,
    },
    reactStrictMode: true,
  })
);
