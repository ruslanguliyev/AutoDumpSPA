import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/i18n/config';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';

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

  useLanguageSync();

  useEffect(() => {
    const urlLang = params.lang;

    if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) {
      hasRedirected.current = false;
    } else if (!hasRedirected.current) {
      // Invalid or missing language in URL, redirect to default
      hasRedirected.current = true;
      const pathWithoutLang = location.pathname.replace(/^\/[^/]+/, '') || '/';
      const targetPath = pathWithoutLang === '/' ? '' : pathWithoutLang;
      navigate(`/${DEFAULT_LANGUAGE}${targetPath}${location.search}`, { replace: true });
    }
  }, [params.lang, navigate, location.pathname, location.search]);

  return <Outlet />;
};

export default LanguageRoute;
