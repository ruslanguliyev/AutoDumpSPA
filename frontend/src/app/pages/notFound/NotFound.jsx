import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import Button from '@/shared/ui/button';

const CATALOG_LINKS = [
  { to: '/autosearch', labelKey: 'nav.cars' },
  { to: '/rent', labelKey: 'nav.rent' },
  { to: '/parts', labelKey: 'nav.parts' },
  { to: '/services', labelKey: 'nav.auto_services' },
  { to: '/specialists', labelKey: 'nav.specialists' },
  { to: '/sellers', labelKey: 'nav.sellers' },
];

export default function NotFound() {
  const { t } = useTranslation('common');
  useDocumentTitle(t('common.pageNotFound'));

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-6xl font-bold tracking-tight text-muted-foreground/60">404</p>
        <h1 className="text-[22px] font-semibold text-foreground">{t('common.pageNotFound')}</h1>
        <p className="text-[15px] text-muted-foreground">{t('common.pageNotFoundHint')}</p>
        <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="min-h-11">
            <Link to="/">{t('common.goHome')}</Link>
          </Button>
          <Button asChild variant="secondary" className="min-h-11">
            <Link to="/autosearch">{t('common.goCatalog')}</Link>
          </Button>
        </div>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {CATALOG_LINKS.map((item) => (
            <li key={item.to}>
              <Button asChild variant="ghost" className="min-h-11">
                <Link to={item.to}>{t(item.labelKey)}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
