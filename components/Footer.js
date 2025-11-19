import { FaInstagram } from 'react-icons/fa';
import { useRouter } from 'next/router';
import styles from '../styles/Footer.module.css';
import Link from 'next/link';

const Footer = () => {
  const router = useRouter();
  const { locale } = router;
  const mappedLocale = locale === 'de' ? 'de' : 'en';

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Copyright */}
        <p className={styles.copyText}>
          © {new Date().getFullYear()} Joan —{' '}
          {mappedLocale === 'de'
            ? 'Alle Rechte vorbehalten.'
            : 'All rights reserved.'}
        </p>

        {/* Navigation Links */}
        <ul className={styles.navList}>
          <li>
            <Link
              href={
                mappedLocale === 'de'
                  ? '/datenschutzerklaerung'
                  : '/privacy-policy'
              }
              className={styles.link}
            >
              {mappedLocale === 'de' ? 'Datenschutz' : 'Privacy Policy'}
            </Link>
          </li>

          <li>
            <Link
              href={mappedLocale === 'de' ? '/impressum' : '/imprint'}
              className={styles.link}
            >
              {mappedLocale === 'de' ? 'Impressum' : 'Imprint'}
            </Link>
          </li>

          <li>
            <Link href="/support" className={styles.link}>
              Support
            </Link>
          </li>

          <li>
            <Link href="/pwa-guide" className={styles.link}>
              {mappedLocale === 'de' ? '📱 App installieren' : '📱 Install App'}
            </Link>
          </li>
        </ul>

        {/* Instagram Icon */}
        <a
          href="https://www.instagram.com/germanhansik"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.instagramLink}
          aria-label={
            mappedLocale === 'de'
              ? 'Besuchen Sie unsere Instagram-Seite'
              : 'Visit our Instagram page'
          }
        >
          <FaInstagram size={25} />
        </a>

        {/* Developed By */}
        <p className={styles.madeBy}>
          {mappedLocale === 'de'
            ? 'Design & Entwicklung von Joan.'
            : 'Designed & developed by Joan.'}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
