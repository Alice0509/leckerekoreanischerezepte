import { useRouter } from 'next/router';
import styles from '../styles/LanguageSwitcher.module.css';
import { getLocalizedNavigationUrl } from '../lib/localizedRoutes';

const LanguageSwitcher = () => {
  const router = useRouter();
  const currentLocale = router.locale === 'de' ? 'de' : 'en';
  const availableLocales = router.locales || ['de', 'en'];

  return (
    <div className={styles.languageSwitcher}>
      {availableLocales.map((locale) => {
        const href = getLocalizedNavigationUrl({
          currentLocale,
          targetLocale: locale,
          path: router.asPath,
        });

        return (
          <a
            key={locale}
            href={href}
            className={`${styles.button} ${
              currentLocale === locale ? styles.active : ''
            }`}
            aria-current={currentLocale === locale ? 'page' : undefined}
          >
            {locale.toUpperCase()}
          </a>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
