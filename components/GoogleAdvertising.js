import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  getAdvertisingClient,
  loadAdvertisingScript,
} from '../lib/google-advertising.cjs';

export default function GoogleAdvertising({ disabled = false }) {
  const router = useRouter();

  useEffect(() => {
    if (disabled) return;
    const publisherId = document.querySelector(
      'meta[name="google-adsense-account"]'
    )?.content;
    const client = getAdvertisingClient(
      process.env.NEXT_PUBLIC_ADSENSE_ENABLED,
      publisherId,
      router.pathname
    );
    if (client) loadAdvertisingScript(document, client);
  }, [disabled, router.pathname]);

  return null;
}
