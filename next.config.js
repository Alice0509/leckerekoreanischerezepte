// next.config.js
module.exports = {
  i18n: {
    locales: ['de', 'en'],
    defaultLocale: 'en',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        // pathname: '/**', // 필요 시 추가
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        // pathname: '/**',
      },
      // 기타 도메인 추가 가능
    ],
  },
  experimental: {
    largePageDataBytes: 150 * 1024, // 선택 사항: 임계값 약간 증가
  },
};
