import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../styles/globals.css';
import Layout from '../components/Layout'; // Layout 컴포넌트 임포트
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { GA_TRACKING_ID } from '../lib/gtag';
import { DefaultSeo } from 'next-seo';
import ToTopButton from '../components/ToTopButton'; // ToTopButton 임포트
import ErrorBoundary from '../components/ErrorBoundary';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', GA_TRACKING_ID, {
          page_path: url,
        });
      }
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return (
    <>
      <DefaultSeo
        title="Korean Recipes"
        description="A multilingual Korean recipes website."
        openGraph={{
          type: 'website',
          locale: 'de',
          url: 'https://www.leckere-koreanische-rezepte.de/',
          site_name: 'Leckere Koreanische Rezepte',
        }}
        additionalMetaTags={[
          {
            name: 'author',
            content: 'Joan',
          },
        ]}
      />

      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && (
        <>
          {/* 비동기 로드 방식 개선 */}
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />
          <Script
            id="google-analytics"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* ErrorBoundary로 감싸기 */}
      <ErrorBoundary>
        {/* 레이아웃으로 감싸기 */}
        <Layout>
          <Component {...pageProps} />
          {/* "To the Top" 버튼 추가 */}
          <ToTopButton />
        </Layout>
      </ErrorBoundary>
    </>
  );
}

export default MyApp;
