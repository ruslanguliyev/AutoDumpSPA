import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES } from '@/i18n/config';
import { formatTitle } from '@/shared/hooks/useDocumentTitle';

/** Section pages whose title is fixed. Detail pages set their own title from their data. */
const SECTION_TITLES = {
  '/autosearch': ['nav.cars', 'Cars'],
  '/parts': ['nav.parts', 'Parts'],
  '/sellers': ['nav.sellers', 'Sellers'],
  '/dealers': ['nav.sellers', 'Sellers'],
  '/services': ['nav.auto_services', 'Auto Services'],
  '/specialists': ['nav.specialists', 'Specialists'],
  '/about': ['nav.about', 'About'],
  '/add': ['nav.addListing', 'Add Listing'],
  '/login': ['nav.account', 'Account'],
  '/register': ['nav.account', 'Account'],
};

const stripLanguage = (pathname) => {
  const [, first, ...rest] = pathname.split('/');
  const without = SUPPORTED_LANGUAGES.includes(first) ? `/${rest.join('/')}` : pathname;
  return without.replace(/\/+$/, '') || '/';
};

/**
 * Keeps the tab title and the <html lang> attribute in sync with the current route and language.
 */
const RouteTitle = () => {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    document.documentElement.lang = i18n.language;

    const path = stripLanguage(pathname);
    if (path === '/') {
      document.title = formatTitle('');
      return;
    }
    if (path === '/dashboard' || path.startsWith('/dashboard/')) {
      document.title = formatTitle(t('nav.dashboard', { defaultValue: 'Dashboard' }));
      return;
    }
    const section = SECTION_TITLES[path];
    if (section) {
      document.title = formatTitle(t(section[0], { defaultValue: section[1] }));
    }
    // Anything else (detail pages, 404) sets its own title.
  }, [pathname, t, i18n.language]);

  return null;
};

export default RouteTitle;
