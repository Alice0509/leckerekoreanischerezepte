export const SITE_ORIGINS = {
  de: 'https://www.leckere-koreanische-rezepte.de',
  en: 'https://www.hansikyoung.com',
};

export const normalizeCanonicalPath = (path = '/') => {
  const cleanPath = (path || '/').split('?')[0].split('#')[0] || '/';
  const withoutLocale = cleanPath.replace(/^\/(de|en)(?=\/|$)/, '');
  return withoutLocale || '/';
};

export const getLocaleCode = (locale) =>
  locale === 'de' || locale === 'de-DE' ? 'de' : 'en';

export const getLocalizedUrl = (locale, path = '/') => {
  const lang = getLocaleCode(locale);
  const normalizedPath = normalizeCanonicalPath(path);

  return `${SITE_ORIGINS[lang]}${normalizedPath === '/' ? '' : normalizedPath}`;
};

export const getSeoUrls = ({ locale = 'en', path = '/' } = {}) => {
  const lang = getLocaleCode(locale);
  const normalizedPath = normalizeCanonicalPath(path);

  return {
    canonicalUrl: getLocalizedUrl(lang, normalizedPath),
    alternateUrls: {
      de: getLocalizedUrl('de', normalizedPath),
      en: getLocalizedUrl('en', normalizedPath),
      xDefault: getLocalizedUrl('en', normalizedPath),
    },
    siteOrigin: SITE_ORIGINS[lang],
    defaultImageUrl: `${SITE_ORIGINS[lang]}/images/default.png`,
  };
};
