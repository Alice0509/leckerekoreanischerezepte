// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="de">
      <Head>
        <link rel="icon" href="/favicon.png" />
        {/* 추가적인 메타 태그나 링크를 여기에 추가할 수 있습니다 */}
        <meta name="msvalidate.01" content="E67787B0E2316783059B9CE18EB45B0E" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
