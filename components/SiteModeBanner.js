import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/SiteModeBanner.module.css';

const copy = {
  de: {
    label: 'Hinweis',
    message:
      'Neue Rezepte und Aktualisierungen sind vorübergehend pausiert. Alle bereits veröffentlichten Rezepte bleiben verfügbar.',
    close: 'Hinweis schließen',
  },
  en: {
    label: 'Note',
    message:
      'New recipes and updates are temporarily paused. All published recipes remain available.',
    close: 'Close notice',
  },
};

function getSiteModeCookie() {
  if (typeof document === 'undefined') {
    return 'normal';
  }

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith('hy-site-mode='));

  return cookie ? decodeURIComponent(cookie.split('=')[1]) : 'normal';
}

export default function SiteModeBanner() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const locale = router.locale === 'de' ? 'de' : 'en';
  const text = copy[locale];

  useEffect(() => {
    setVisible(getSiteModeCookie() === 'updates-paused');
  }, [router.asPath]);

  if (!visible) {
    return null;
  }

  return (
    <aside className={styles.banner} aria-label={text.label}>
      <div className={styles.inner}>
        <p className={styles.message}>
          <strong>{text.label}:</strong> {text.message}
        </p>

        <button
          className={styles.close}
          type="button"
          aria-label={text.close}
          onClick={() => setVisible(false)}
        >
          ×
        </button>
      </div>
    </aside>
  );
}
