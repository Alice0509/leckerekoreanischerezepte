// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="de">
        <Head>
          {/* ---------- PWA ---------- */}
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#8db580" />

          {/* ---------- iOS 웹앱 ---------- */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="젊은한식" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/icons/apple-touch-icon-180.png"
          />

          {/* ---------- Favicon ---------- */}
          <link rel="icon" href="/favicon.png" />
          <meta
            name="msvalidate.01"
            content="E67787B0E2316783059B9CE18EB45B0E"
          />

          {/* ---------- Instagram embed ---------- */}
          <script async defer src="https://www.instagram.com/embed.js" />
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
