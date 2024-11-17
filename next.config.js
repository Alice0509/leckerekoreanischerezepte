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
        pathname: '/**',
      },
      // 필요에 따라 추가적인 호스트 패턴을 여기에 추가할 수 있습니다.
      // 예를 들어, Contentful의 다른 이미지 호스트가 있다면 추가
      {
        protocol: 'https',
        hostname: '**.contentful.com',
        pathname: '/**',
      },
    ],
  },
};
