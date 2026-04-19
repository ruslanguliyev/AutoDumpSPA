import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/i18n/config';

/**
 * Get language from URL path
 */
export const getLanguageFromPath = (pathname) => {
  const match = pathname.match(/^\/([^/]+)/);
  if (match && match[1]) {
    const lang = match[1];
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      return lang;
    }
  }
  return null;
};

/**
 * Remove language prefix from path
 */
export const removeLanguageFromPath = (pathname) => {
  const lang = getLanguageFromPath(pathname);
  if (lang) {
    const withoutLang = pathname.replace(`/${lang}`, '') || '/';
    return withoutLang;
  }
  return pathname;
};

/**
 * Add language prefix to path
 */
export const addLanguageToPath = (pathname, lang) => {
  const pathWithoutLang = removeLanguageFromPath(pathname);
  const cleanPath = pathWithoutLang === '/' ? '' : pathWithoutLang;
  return `/${lang}${cleanPath}`;
};

/**
 * Get current language from path or return default
 */
export const getCurrentLanguage = (pathname) => {
  return getLanguageFromPath(pathname) || DEFAULT_LANGUAGE;
};
