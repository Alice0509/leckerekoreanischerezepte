import Script from 'next/script';

const CLARITY_ID_PATTERN = /^[a-z0-9]+$/i;

const getClarityProjectId = (locale) => {
  const projectId =
    locale === 'de'
      ? process.env.NEXT_PUBLIC_CLARITY_ID_DE
      : process.env.NEXT_PUBLIC_CLARITY_ID_EN;

  return CLARITY_ID_PATTERN.test(projectId || '') ? projectId : '';
};

export const denyClarityConsent = () => {
  if (typeof window === 'undefined' || typeof window.clarity !== 'function') {
    return;
  }

  window.clarity('consentv2', {
    ad_Storage: 'denied',
    analytics_Storage: 'denied',
  });
};

const ClarityAnalytics = ({ enabled, locale }) => {
  const projectId = getClarityProjectId(locale);

  if (!enabled || !projectId) {
    return null;
  }

  return (
    <Script
      id={`microsoft-clarity-${locale}`}
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){
              (c[a].q=c[a].q||[]).push(arguments)
            };
            t=l.createElement(r);
            t.async=1;
            t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${projectId}");

          window.clarity("consentv2", {
            ad_Storage: "denied",
            analytics_Storage: "granted"
          });
        `,
      }}
    />
  );
};

export default ClarityAnalytics;
