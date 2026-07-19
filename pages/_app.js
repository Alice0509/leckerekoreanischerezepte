import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../styles/globals.css';
import Layout from '../components/Layout';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GA_TRACKING_ID } from '../lib/gtag';
import { DefaultSeo } from 'next-seo';
import ToTopButton from '../components/ToTopButton';
import ErrorBoundary from '../components/ErrorBoundary';
import SiteMusicPlayer from '../components/SiteMusicPlayer';
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const mappedLocale = router.locale === 'de' ? 'de' : 'en';

  const cookieCopy =
    mappedLocale === 'de'
      ? {
          accept: 'Akzeptieren',
          decline: 'Ablehnen',
          message:
            'Diese Website verwendet optionale Analyse-Cookies, um die Nutzung der Website besser zu verstehen.',
          learnMore: 'Mehr erfahren',
          privacyUrl: '/datenschutzerklaerung',
        }
      : {
          accept: 'Accept',
          decline: 'Decline',
          message:
            'This website uses optional analytics cookies to help us understand how the site is used.',
          learnMore: 'Learn more',
          privacyUrl: '/privacy-policy',
        };

  useEffect(() => {
    // 쿠키 동의 여부 확인
    if (getCookieConsentValue() === 'true') {
      setCookiesAccepted(true);
    }

    // Google Analytics 트래킹 (쿠키 동의한 경우에만 실행)
    const handleRouteChange = (url) => {
      if (cookiesAccepted && typeof window.gtag !== 'undefined') {
        window.gtag('config', GA_TRACKING_ID, {
          page_path: url,
          anonymize_ip: true, // ✅ IP 익명화 (GDPR 준수)
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, cookiesAccepted]);

  return (
    <>
      <DefaultSeo
        titleTemplate="%s"
        defaultTitle="Hansik Young"
        openGraph={{
          site_name: 'Hansik Young',
        }}
        additionalMetaTags={[
          {
            name: 'author',
            content: 'Joan',
          },
        ]}
      />

      {/* ✅ Google Analytics (쿠키 동의한 경우에만 실행) */}
      {cookiesAccepted && process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && (
        <>
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
                  anonymize_ip: true, // ✅ IP 주소 익명화 (GDPR 준수)
                });
              `,
            }}
          />
        </>
      )}

      {/* ErrorBoundary로 감싸기 */}
      <ErrorBoundary>
        <Layout>
          <Component {...pageProps} />
          <ToTopButton />
          <SiteMusicPlayer />
        </Layout>
      </ErrorBoundary>

      {/* ✅ 쿠키 동의 배너 */}
      <CookieConsent
        location="bottom"
        buttonText={cookieCopy.accept}
        declineButtonText={cookieCopy.decline}
        enableDeclineButton // "거부" 버튼 활성화
        onAccept={() => setCookiesAccepted(true)} // ✅ 쿠키 동의 → Google Analytics 활성화
        onDecline={() => setCookiesAccepted(false)} // ✅ 쿠키 거부 → Google Analytics 비활성화
        style={{
          background: '#222',
          color: '#fff',
          fontSize: '14px',
          padding: '15px',
        }}
        buttonStyle={{
          background: '#ff6600',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 12px',
          border: 'none',
          cursor: 'pointer',
        }}
        declineButtonStyle={{
          background: '#999',
          color: '#fff',
          fontSize: '14px',
          padding: '8px 12px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {cookieCopy.message}{' '}
        <a
          href={cookieCopy.privacyUrl}
          style={{ color: '#ffcc00', textDecoration: 'underline' }}
        >
          {cookieCopy.learnMore}
        </a>
      </CookieConsent>
    </>
  );
}

export default MyApp;
