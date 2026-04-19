import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useUIStore } from '@/shared/store/uiStore';
import { SUPPORTED_LANGUAGES } from '@/i18n/config';

const getLangFromPath = (pathname) => {
  const match = pathname.match(/^\/([^/]+)/);
  if (!match?.[1]) return null;
  return SUPPORTED_LANGUAGES.includes(match[1]) ? match[1] : null;
};

const stripLangPrefix = (pathname) => {
  const lang = getLangFromPath(pathname);
  if (!lang) return pathname;
  const without = pathname.replace(`/${lang}`, '');
  return without === '' ? '/' : without;
};

/**
 * Hook to get current language and change language with URL sync
 * Should be used in components that need to change language
 */
export const useLanguageSync = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { language: storeLanguage, setLanguage: setStoreLanguage } = useUIStore();

  // Get current language from URL (preferred) or store (fallback)
  // Check both params.lang (for /:lang routes) and pathname (for direct routes)
  const urlLang = params.lang || getLangFromPath(location.pathname);
  const currentLanguage = (urlLang && SUPPORTED_LANGUAGES.includes(urlLang))
    ? urlLang
    : storeLanguage;

  // Sync URL language with store on mount/URL change
  useEffect(() => {
    if (urlLang && urlLang !== storeLanguage) {
      // URL has different language than store, sync store to URL
      setStoreLanguage(urlLang).catch(console.error);
    }
  }, [urlLang, storeLanguage, setStoreLanguage]);

  const setLanguage = async (lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Invalid language: ${lang}`);
      return;
    }

    if (lang === currentLanguage) {
      // Already on this language, no need to change
      return;
    }

    try {
      // Update store (which updates i18next)
      await setStoreLanguage(lang);
      
      // Update URL - always add language prefix
      const pathWithoutLang = stripLangPrefix(location.pathname);
      const targetPath = pathWithoutLang === '/' ? '' : pathWithoutLang;
      const newPath = `/${lang}${targetPath}${location.search}`;
      
      // Use replace: true to avoid adding to history
      navigate(newPath, { replace: true });
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return {
    language: currentLanguage,
    setLanguage,
  };
};
