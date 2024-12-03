// components/Footer.js
import { FaInstagram } from 'react-icons/fa';
import { useRouter } from 'next/router';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  const router = useRouter();
  const { locale } = router;
  const mappedLocale = locale === 'de' ? 'de' : 'en';

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* 저작권 텍스트 */}
        <p>
          &copy; {new Date().getFullYear()}{' '}
          {mappedLocale === 'de'
            ? 'Alle Rechte vorbehalten.'
            : 'All rights reserved.'}
        </p>

        {/* 작성자 텍스트 */}
        <p>
          {mappedLocale === 'de' ? 'Erstellt von Joan.' : 'Created by Joan.'}
        </p>

        {/* 인스타그램 버튼 */}
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
