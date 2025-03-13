const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // 개발 모드에서 PWA 비활성화
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
      largePageDataBytes: 150 * 1024, // 실험적 기능
    },
    reactStrictMode: true, // React Strict 모드 활성화
  })
);
