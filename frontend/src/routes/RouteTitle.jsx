import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES } from '@/i18n/config';
import { ROUTES } from '@/shared/constants/routes';
import { formatTitle } from '@/shared/hooks/useDocumentTitle';

/** Section pages whose title is fixed. Detail pages set their own title from their data. */
const SECTION_TITLES = {
  [ROUTES.cars]: ['nav.cars', 'Cars'],
  [ROUTES.rent]: ['nav.rent', 'Rent'],
  [ROUTES.parts]: ['nav.parts', 'Parts'],
  [ROUTES.sellers]: ['nav.sellers', 'Sellers'],
  [ROUTES.dealers]: ['nav.sellers', 'Sellers'],
  [ROUTES.services]: ['nav.auto_services', 'Auto Services'],
  [ROUTES.specialists]: ['nav.specialists', 'Specialists'],
  [ROUTES.about]: ['nav.about', 'About'],
  [ROUTES.add]: ['nav.addListing', 'Add Listing'],
  [ROUTES.login]: ['nav.account', 'Account'],
  [ROUTES.register]: ['nav.account', 'Account'],
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
