import localizedRoutes from './generated-localized-routes.json';
import {
  SITE_ORIGINS,
  getLocaleCode,
  normalizeCanonicalPath,
} from './siteUrls';

const normalizeSlug = (value) => {
  if (typeof value !== 'string') return '';

  return value.trim().replace(/^\/+/, '').replace(/\/+$/, '');
};

const splitPathAndSuffix = (value = '/') => {
  const match = String(value || '/').match(/^([^?#]*)(.*)$/);

  return {
    pathname: match?.[1] || '/',
    suffix: match?.[2] || '',
  };
};

const getRecipeUrl = (locale, slug) => {
  const lang = getLocaleCode(locale);
  const normalizedSlug = normalizeSlug(slug);

  return `${SITE_ORIGINS[lang]}/recipes/${normalizedSlug}`;
};

const findRecipeEntryId = ({ locale, slug }) => {
  const lang = getLocaleCode(locale);
  const normalizedSlug = normalizeSlug(slug);

  return (
    localizedRoutes.recipeIdBySlug?.[lang]?.[normalizedSlug] ||
    localizedRoutes.recipeIdBySlug?.de?.[normalizedSlug] ||
    localizedRoutes.recipeIdBySlug?.en?.[normalizedSlug] ||
    null
  );
};

export const getRecipeSeoUrls = ({
  locale = 'en',
  entryId,
  currentSlug,
} = {}) => {
  const lang = getLocaleCode(locale);
  const localizedRecipe = localizedRoutes.recipesById?.[entryId];
  const fallbackSlug = normalizeSlug(currentSlug);

  const deSlug = normalizeSlug(localizedRecipe?.de) || fallbackSlug;
  const enSlug = normalizeSlug(localizedRecipe?.en) || fallbackSlug;
  const canonicalSlug = lang === 'de' ? deSlug : enSlug;

  return {
    canonicalUrl: getRecipeUrl(lang, canonicalSlug),
    alternateUrls: {
      de: getRecipeUrl('de', deSlug),
      en: getRecipeUrl('en', enSlug),
      xDefault: getRecipeUrl('en', enSlug),
    },
    localizedSlugs: {
      de: deSlug,
      en: enSlug,
    },
    siteOrigin: SITE_ORIGINS[lang],
    defaultImageUrl: `${SITE_ORIGINS[lang]}/images/default.png`,
  };
};

export const getLocalizedNavigationUrl = ({
  currentLocale = 'en',
  targetLocale = 'en',
  path = '/',
} = {}) => {
  const targetLang = getLocaleCode(targetLocale);
  const { pathname, suffix } = splitPathAndSuffix(path);
  const normalizedPath = normalizeCanonicalPath(pathname);

  let targetPath = normalizedPath;

  const recipeMatch = normalizedPath.match(/^\/recipes\/([^/]+)\/?$/);

  if (recipeMatch) {
    let currentSlug = recipeMatch[1];

    try {
      currentSlug = decodeURIComponent(currentSlug);
    } catch {
      // 잘못 인코딩된 경로라면 원래 slug를 그대로 사용한다.
    }

    const entryId = findRecipeEntryId({
      locale: currentLocale,
      slug: currentSlug,
    });

    const targetSlug = normalizeSlug(
      localizedRoutes.recipesById?.[entryId]?.[targetLang]
    );

    if (targetSlug) {
      targetPath = `/recipes/${targetSlug}`;
    }
  }

  const baseUrl =
    targetPath === '/'
      ? `${SITE_ORIGINS[targetLang]}/`
      : `${SITE_ORIGINS[targetLang]}${targetPath}`;

  return `${baseUrl}${suffix}`;
};
