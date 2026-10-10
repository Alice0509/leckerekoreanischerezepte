import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  getAdvertisingClient,
  subscribeAdvertisingPrivacy,
  reopenAdvertisingPrivacy,
} from '../lib/google-advertising.cjs';
import styles from '../styles/Footer.module.css';

export default function AdvertisingPrivacyButton() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const publisherId = document.querySelector(
      'meta[name="google-adsense-account"]'
    )?.content;
    const client = getAdvertisingClient(
      process.env.NEXT_PUBLIC_ADSENSE_ENABLED,
      publisherId,
      router.pathname
    );
    setReady(false);
    if (!client) return;
    return subscribeAdvertisingPrivacy(window, setReady);
  }, [router.pathname]);

  if (!ready) return null;

  return (
    <button
      type="button"
      className={styles.privacyButton}
      onClick={() => reopenAdvertisingPrivacy(window)}
    >
      {router.locale === 'de'
        ? 'Datenschutzeinstellungen für Werbung'
        : 'Advertising privacy settings'}
    </button>
  );
}
