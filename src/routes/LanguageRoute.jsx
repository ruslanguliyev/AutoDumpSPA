import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

// Hardcoded constants to avoid import issues
const SUPPORTED_LANGUAGES = ['en', 'ru', 'az'];
const DEFAULT_LANGUAGE = 'en';

/**
 * Language route wrapper that:
 * 1. Validates language in URL
 * 2. Redirects to default language if invalid
 */
const LanguageRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const urlLang = params.lang;

    if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) {
      // Valid language - try to sync with store (non-blocking)
      import('@/shared/store/uiStore').then(({ useUIStore }) => {
        const { language: storeLanguage, setLanguage } = useUIStore.getState();
        if (urlLang !== storeLanguage) {
          import('@/i18n').then(({ changeLanguage }) => {
            changeLanguage(urlLang).catch(console.error);
            useUIStore.getState().setLanguage(urlLang).catch(console.error);
          }).catch(console.error);
        }
      }).catch(console.error);
      hasRedirected.current = false;
    } else if (!hasRedirected.current) {
      // Invalid or missing language in URL, redirect to default
      hasRedirected.current = true;
      const pathWithoutLang = location.pathname.replace(/^\/[^/]+/, '') || '/';
      const targetPath = pathWithoutLang === '/' ? '' : pathWithoutLang;
      navigate(`/${DEFAULT_LANGUAGE}${targetPath}${location.search}`, { replace: true });
    }
  }, [params.lang, navigate, location.pathname, location.search]);

  // Always render, but handle language validation
  if (!params.lang || !SUPPORTED_LANGUAGES.includes(params.lang)) {
    // Still render children, but language will be default
    return <Outlet />;
  }

  return <Outlet />;
};

export default LanguageRoute;
