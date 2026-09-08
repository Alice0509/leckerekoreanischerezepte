import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import { useRouter } from 'next/router';
import styles from '../styles/Navbar.module.css';
import { getLocalizedNavigationUrl } from '../lib/localizedRoutes';
import {
  RECIPE_CATEGORY_ORDER,
  getRecipeCategoryLabel,
  getRecipeCategorySlug,
} from '../lib/recipeCategories';

const wordmarkFont = Fraunces({
  subsets: ['latin'],
  display: 'swap',
});

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);

    router.events.on('routeChangeStart', closeMenu);

    return () => {
      router.events.off('routeChangeStart', closeMenu);
    };
  }, [router.events]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const labels =
    mappedLocale === 'de'
      ? {
          recipes: 'Rezepte',
          cookingPlan: 'Kochplan',
          ingredients: 'Zutaten',
          about: 'Über uns',
          install: 'App installieren',
          menu: 'Menü öffnen',
          close: 'Menü schließen',
        }
      : {
          recipes: 'Recipes',
          cookingPlan: 'Cooking Plan',
          ingredients: 'Ingredients',
          about: 'About Us',
          install: 'Install App',
          menu: 'Open menu',
          close: 'Close menu',
        };

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/myLogo1.png"
            alt=""
            width={46}
            height={46}
            className={styles.logo}
            priority
          />
          <span className={`${styles.brandName} ${wordmarkFont.className}`}>
            Hansik Young
          </span>
        </Link>

        <div className={styles.desktopNav}>
          <Link href="/#all-recipes" className={styles.navLink}>
            {labels.recipes}
          </Link>

          <Link href="/cooking-plan" className={styles.navLink}>
            {labels.cookingPlan}
          </Link>

          <Link href="/ingredients" className={styles.navLink}>
            {labels.ingredients}
          </Link>

          <Link href="/about-us" className={styles.navLink}>
            {labels.about}
          </Link>
        </div>

        <div className={styles.desktopActions}>
          <Link href="/pwa-guide" className={styles.pwaLink}>
            📱 {labels.install}
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

        <div className={styles.mobileActions}>
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

          <button
            type="button"
            className={styles.menuButton}
            aria-label={labels.menu}
            aria-expanded={menuOpen}
            aria-controls="mobile-site-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenuLayer}>
          <button
            type="button"
            className={styles.backdrop}
            aria-label={labels.close}
            onClick={() => setMenuOpen(false)}
          />

          <div
            id="mobile-site-menu"
            className={styles.mobileMenu}
            role="dialog"
            aria-modal="true"
            aria-label={mappedLocale === 'de' ? 'Navigation' : 'Navigation'}
          >
            <div className={styles.mobileMenuHeader}>
              <span
                className={`${styles.mobileMenuBrand} ${wordmarkFont.className}`}
              >
                Hansik Young
              </span>

              <button
                type="button"
                className={styles.closeButton}
                aria-label={labels.close}
                onClick={() => setMenuOpen(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.mobileMenuLinks}>
              <Link
                href="/#all-recipes"
                className={styles.mobileMenuLink}
                onClick={() => setMenuOpen(false)}
              >
                {labels.recipes}
              </Link>

              <Link
                href="/cooking-plan"
                className={styles.mobileMenuLink}
                onClick={() => setMenuOpen(false)}
              >
                {labels.cookingPlan}
              </Link>

              <Link
                href="/ingredients"
                className={styles.mobileMenuLink}
                onClick={() => setMenuOpen(false)}
              >
                {labels.ingredients}
              </Link>

              <Link
                href="/about-us"
                className={styles.mobileMenuLink}
                onClick={() => setMenuOpen(false)}
              >
                {labels.about}
              </Link>
            </div>

            <div className={styles.mobileCategorySection}>
              <p className={styles.mobileCategoryTitle}>
                {mappedLocale === 'de'
                  ? 'Nach Kategorie'
                  : 'Browse by category'}
              </p>

              <div className={styles.mobileCategoryLinks}>
                {RECIPE_CATEGORY_ORDER.map((categoryKey) => (
                  <Link
                    key={categoryKey}
                    href={`/categories/${getRecipeCategorySlug(categoryKey)}`}
                    className={styles.mobileCategoryLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    {getRecipeCategoryLabel(categoryKey, mappedLocale)}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.mobileMenuFooter}>
              <Link
                href="/pwa-guide"
                className={styles.mobileInstallLink}
                onClick={() => setMenuOpen(false)}
              >
                📱 {labels.install}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
