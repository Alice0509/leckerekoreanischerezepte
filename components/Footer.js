// components/Footer.js

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
        <p>
          &copy; {new Date().getFullYear()}{' '}
          {mappedLocale === 'de'
            ? 'Alle Rechte vorbehalten.'
            : 'All rights reserved.'}
        </p>

        {/* Creator */}
        <p>
          {mappedLocale === 'de' ? 'Erstellt von Joan.' : 'Created by Joan.'}
        </p>

        {/* Navigation Links */}
        <ul className={styles.navList}>
          <li>
            <Link href="/privacy-policy" className={styles.link}>
              {mappedLocale === 'de'
                ? 'Datenschutzerklärung'
                : 'Privacy Policy'}
            </Link>
          </li>
          {/* Add more links here if needed */}
        </ul>

        {/* Instagram Button */}
        <a
          href="https://www.instagram.com/germanhansik"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.instagramLink}
          aria-label="Visit our Instagram page"
        >
          <FaInstagram size={24} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
