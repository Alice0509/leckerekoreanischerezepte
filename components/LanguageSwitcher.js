// components/LanguageSwitcher.js
import { useRouter } from 'next/router';
import styles from '../styles/LanguageSwitcher.module.css';

/*
const languageNames = {
  en: 'English',
  de: 'Deutsch',
};
*/

const LanguageSwitcher = () => {
  const router = useRouter();
  const { locales, locale, pathname, query, asPath } = router;

  const changeLanguage = (newLocale) => {
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <div className={styles.languageSwitcher}>
      {locales.map((lng) => (
        <button
          key={lng}
          onClick={() => changeLanguage(lng)}
          className={`${styles.button} ${locale === lng ? styles.active : ''}`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
