// components/Footer.js
import React from 'react';
import styles from '../styles/Footer.module.css';
import { useRouter } from 'next/router';
import { FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const router = useRouter();
  const { locale } = router;
  const mappedLocale = locale === 'de' ? 'de' : 'en';

  return (
    <footer className={styles.footer}>
      <p>
        &copy; {new Date().getFullYear()}{' '}
        {mappedLocale === 'de'
          ? 'Alle Rechte vorbehalten.'
          : 'All rights reserved.'}
      </p>
      <p>{mappedLocale === 'de' ? 'Erstellt von Joan.' : 'Created by Joan.'}</p>
      {/* 인스타그램 링크 */}
      <a
        href="https://www.instagram.com/germanhansik"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.instagramLink}
      >
        <FaInstagram size={24} />
      </a>
    </footer>
  );
};

export default Footer;
