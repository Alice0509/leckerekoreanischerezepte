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
      <Link href="/" className={styles.navLink}>
        {mappedLocale === 'de' ? 'Startseite' : 'Home'}
      </Link>
      <Link href="/ingredients" className={styles.navLink}>
        {mappedLocale === 'de' ? 'Zutaten' : 'Ingredients'}
      </Link>
      <Link href="/gallery" className={styles.navLink}>
        {locale === 'de' ? 'Galerie' : 'Gallery'}
      </Link>
      <Link href="/about-us" className={styles.navLink}>
        {mappedLocale === 'de' ? 'Über uns' : 'About Us'}
      </Link>

      {/* ✅ PWA 설치 페이지 버튼 추가 */}
      <Link href="/pwa-guide" className={styles.pwaLink}>
        {mappedLocale === 'de' ? '📱 App installieren' : '📱 Install App'}
      </Link>

      {/* 언어 스위치 */}
      <div className={styles.languageSwitcher}>
        <Link href={router.asPath} locale="de" className={styles.langLink}>
          DE
        </Link>
        |
        <Link href={router.asPath} locale="en" className={styles.langLink}>
          EN
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
