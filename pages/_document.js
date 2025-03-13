import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="de">
        {' '}
        {/* 언어 설정 추가 */}
        <Head>
          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ff6600" />

          {/* ✅ iOS 아이콘 추가 */}
          <link
            rel="apple-touch-icon"
            sizes="192x192"
            href="/icons/icon-192x192.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="512x512"
            href="/icons/icon-512x512.png"
          />

          {/* 아이콘 및 기타 메타태그 추가 */}
          <link rel="icon" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
          <meta
            name="msvalidate.01"
            content="E67787B0E2316783059B9CE18EB45B0E"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
