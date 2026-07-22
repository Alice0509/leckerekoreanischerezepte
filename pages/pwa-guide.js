import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { getSeoUrls } from '../lib/siteUrls';
import styles from '../styles/PwaGuide.module.css';

const CONTENT = {
  de: {
    eyebrow: 'Hansik Young auf deinem Startbildschirm',
    title: 'Die deutsche Hansik-Young-App installieren',
    intro:
      'Installiere die deutsche Rezeptseite für schnellen Zugriff direkt vom Startbildschirm.',
    appLabel: 'Diese Installation gehört zu',
    appDomain: 'www.leckere-koreanische-rezepte.de',
    separationTitle: 'Deutsch und Englisch sind getrennte Installationen',
    separationText:
      'Die deutsche und die englische Website verwenden unterschiedliche Domains. Wenn du von der installierten deutschen App zu EN wechselst, verlässt du den Bereich dieser App. Die englische Version kannst du separat über hansikyoung.com installieren.',
    installedTitle: 'Die App ist bereits geöffnet',
    installedText:
      'Du verwendest Hansik Young gerade im installierten App-Modus.',
    installReady:
      'Dein Browser unterstützt die direkte Installation. Tippe auf den Button.',
    manualInstall:
      'Falls kein Installationsbutton erscheint, nutze die Anleitung für dein Gerät.',
    button: 'Deutsche App installieren',
    androidTitle: 'Android und Chrome',
    androidSteps: [
      'Öffne diese Seite in Chrome.',
      'Tippe oben rechts auf das Drei-Punkte-Menü.',
      'Wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“.',
    ],
    iosTitle: 'iPhone und iPad',
    iosSteps: [
      'Öffne diese Seite in Safari.',
      'Tippe auf das Teilen-Symbol.',
      'Wähle „Zum Home-Bildschirm“ und bestätige.',
    ],
    otherTitle: 'Lieber die englische App?',
    otherText: 'Öffne die englische Website und installiere sie dort separat.',
    otherLink: 'Englische Website öffnen',
    otherUrl: 'https://www.hansikyoung.com/pwa-guide',
  },
  en: {
    eyebrow: 'Hansik Young on your home screen',
    title: 'Install the English Hansik Young app',
    intro:
      'Install the English recipe site for quick access from your home screen.',
    appLabel: 'This installation belongs to',
    appDomain: 'www.hansikyoung.com',
    separationTitle: 'German and English are separate installations',
    separationText:
      'The German and English sites use different domains. Switching to DE from the installed English app leaves that app’s scope. You can install the German version separately from the German website.',
    installedTitle: 'The app is already open',
    installedText:
      'You are currently using Hansik Young in installed app mode.',
    installReady:
      'Your browser supports direct installation. Tap the button below.',
    manualInstall:
      'When no install button appears, follow the instructions for your device.',
    button: 'Install English app',
    androidTitle: 'Android and Chrome',
    androidSteps: [
      'Open this page in Chrome.',
      'Tap the three-dot menu in the top-right corner.',
      'Choose “Install app” or “Add to Home screen”.',
    ],
    iosTitle: 'iPhone and iPad',
    iosSteps: [
      'Open this page in Safari.',
      'Tap the Share button.',
      'Choose “Add to Home Screen” and confirm.',
    ],
    otherTitle: 'Prefer the German app?',
    otherText: 'Open the German website and install it separately there.',
    otherLink: 'Open German website',
    otherUrl: 'https://www.leckere-koreanische-rezepte.de/pwa-guide',
  },
};

export default function PwaGuide() {
  const router = useRouter();
  const lang = router.locale === 'de' ? 'de' : 'en';
  const t = CONTENT[lang];

  const deferredPromptRef = useRef(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const seoUrls = getSeoUrls({
    locale: lang,
    path: '/pwa-guide',
  });

  useEffect(() => {
    const detectStandalone = () => {
      const displayModeStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches;

      const iosStandalone = window.navigator.standalone === true;

      setIsStandalone(displayModeStandalone || iosStandalone);
    };

    const handleInstallPrompt = (event) => {
      event.preventDefault();
      deferredPromptRef.current = event;
      setCanInstall(true);
    };

    const handleInstalled = () => {
      deferredPromptRef.current = null;
      setCanInstall(false);
      setIsStandalone(true);
    };

    detectStandalone();

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const promptEvent = deferredPromptRef.current;

    if (!promptEvent) return;

    await promptEvent.prompt();
    await promptEvent.userChoice;

    deferredPromptRef.current = null;
    setCanInstall(false);
  };

  return (
    <>
      <NextSeo
        title={`${t.title} | Hansik Young`}
        description={t.intro}
        canonical={seoUrls.canonicalUrl}
        noindex
        languageAlternates={[
          {
            hrefLang: 'de',
            href: seoUrls.alternateUrls.de,
          },
          {
            hrefLang: 'en',
            href: seoUrls.alternateUrls.en,
          },
          {
            hrefLang: 'x-default',
            href: seoUrls.alternateUrls.xDefault,
          },
        ]}
      />

      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className={styles.intro}>{t.intro}</p>

          <div className={styles.domainCard}>
            <span>{t.appLabel}</span>
            <strong>{t.appDomain}</strong>
          </div>

          {isStandalone ? (
            <div className={styles.statusCard} aria-live="polite">
              <strong>{t.installedTitle}</strong>
              <p>{t.installedText}</p>
            </div>
          ) : (
            <div className={styles.installArea}>
              <p>{canInstall ? t.installReady : t.manualInstall}</p>

              {canInstall && (
                <button
                  type="button"
                  className={styles.installButton}
                  onClick={handleInstall}
                >
                  {t.button}
                </button>
              )}
            </div>
          )}
        </section>

        <section className={styles.languageNotice}>
          <h2>{t.separationTitle}</h2>
          <p>{t.separationText}</p>
        </section>

        <section className={styles.instructions}>
          <article className={styles.instructionCard}>
            <span className={styles.deviceIcon}>A</span>
            <h2>{t.androidTitle}</h2>

            <ol>
              {t.androidSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className={styles.instructionCard}>
            <span className={styles.deviceIcon}>iOS</span>
            <h2>{t.iosTitle}</h2>

            <ol>
              {t.iosSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        </section>

        <section className={styles.otherLanguage}>
          <div>
            <h2>{t.otherTitle}</h2>
            <p>{t.otherText}</p>
          </div>

          <a href={t.otherUrl}>{t.otherLink}</a>
        </section>
      </main>
    </>
  );
}
