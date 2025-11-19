import React from 'react';
import Link from 'next/link';
import styles from '../styles/Navbar.module.css';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();
  const { locale } = router;
  const mappedLocale = locale === 'de' ? 'de' : 'en';

  return (
    <nav className={styles.navbar}>
      {/* Left: Home / Logo */}
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>
          {mappedLocale === 'de' ? 'Startseite' : 'Home'}
        </Link>
      </div>

      {/* Center: Main menu */}
      <div className={styles.center}>
        <Link href="/ingredients" className={styles.navLink}>
          {mappedLocale === 'de' ? 'Zutaten' : 'Ingredients'}
        </Link>
        <Link href="/gallery" className={styles.navLink}>
          {mappedLocale === 'de' ? 'Galerie' : 'Gallery'}
        </Link>
        <Link href="/about-us" className={styles.navLink}>
          {mappedLocale === 'de' ? 'Über uns' : 'About Us'}
        </Link>
      </div>

      {/* Right: PWA button + Lang switch */}
      <div className={styles.right}>
        <Link href="/pwa-guide" className={styles.pwaLink}>
          {mappedLocale === 'de' ? '📱 App installieren' : '📱 Install App'}
        </Link>

        <div className={styles.langSwitch}>
          <Link href={router.asPath} locale="de" className={styles.langLink}>
            DE
          </Link>
          <span className={styles.langDivider}>|</span>
          <Link href={router.asPath} locale="en" className={styles.langLink}>
            EN
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
