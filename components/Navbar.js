import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Navbar.module.css';
import { getLocalizedNavigationUrl } from '../lib/localizedRoutes';

const Navbar = () => {
  const router = useRouter();
  const mappedLocale = router.locale === 'de' ? 'de' : 'en';

  const deHref = getLocalizedNavigationUrl({
    currentLocale: mappedLocale,
    targetLocale: 'de',
    path: router.asPath,
  });

  const enHref = getLocalizedNavigationUrl({
    currentLocale: mappedLocale,
    targetLocale: 'en',
    path: router.asPath,
  });

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>
          {mappedLocale === 'de' ? 'Startseite' : 'Home'}
        </Link>
      </div>

      <div className={styles.center}>
        <Link href="/ingredients" className={styles.navLink}>
          {mappedLocale === 'de' ? 'Zutaten' : 'Ingredients'}
        </Link>

        <Link href="/gallery" className={styles.navLink}>
          {mappedLocale === 'de' ? 'Favoriten' : 'Favorites'}
        </Link>

        <Link href="/about-us" className={styles.navLink}>
          {mappedLocale === 'de' ? 'Über uns' : 'About Us'}
        </Link>
      </div>

      <div className={styles.right}>
        <Link href="/pwa-guide" className={styles.pwaLink}>
          {mappedLocale === 'de' ? '📱 App installieren' : '📱 Install App'}
        </Link>

        <div className={styles.langSwitch}>
          <a
            href={deHref}
            className={styles.langLink}
            aria-current={mappedLocale === 'de' ? 'page' : undefined}
          >
            DE
          </a>

          <span className={styles.langDivider}>|</span>

          <a
            href={enHref}
            className={styles.langLink}
            aria-current={mappedLocale === 'en' ? 'page' : undefined}
          >
            EN
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
