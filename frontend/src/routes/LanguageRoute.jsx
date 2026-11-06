import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/i18n/config';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import NotFound from '@/app/pages/notFound/NotFound';

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

  // "/something" with a single unknown segment is just a page that does not exist.
  const isUnknownPage =
    Boolean(params.lang) &&
    !SUPPORTED_LANGUAGES.includes(params.lang) &&
    location.pathname.replace(/\/+$/, '').split('/').length <= 2;

  useEffect(() => {
    const urlLang = params.lang;
    if (isUnknownPage) return;

    if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang)) {
      hasRedirected.current = false;
    } else if (!hasRedirected.current) {
      // Invalid or missing language in URL, redirect to default
      hasRedirected.current = true;
      const pathWithoutLang = location.pathname.replace(/^\/[^/]+/, '') || '/';
      const targetPath = pathWithoutLang === '/' ? '' : pathWithoutLang;
      navigate(`/${DEFAULT_LANGUAGE}${targetPath}${location.search}`, { replace: true });
    }
  }, [params.lang, navigate, location.pathname, location.search, isUnknownPage]);

  if (isUnknownPage) return <NotFound />;
  return <Outlet />;
};

export default LanguageRoute;
