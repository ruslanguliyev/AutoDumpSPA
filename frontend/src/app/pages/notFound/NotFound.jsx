import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES, withLang } from '@/shared/constants/routes';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import Button from '@/shared/ui/button';

const CATALOG_LINKS = [
  { to: ROUTES.cars, labelKey: 'nav.cars' },
  { to: ROUTES.rent, labelKey: 'nav.rent' },
  { to: ROUTES.parts, labelKey: 'nav.parts' },
  { to: ROUTES.services, labelKey: 'nav.auto_services' },
  { to: ROUTES.specialists, labelKey: 'nav.specialists' },
  { to: ROUTES.sellers, labelKey: 'nav.sellers' },
];

export default function NotFound() {
  const { t } = useTranslation('common');
  const { language } = useLanguageSync();
  useDocumentTitle(t('common.pageNotFound'));

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-6xl font-bold tracking-tight text-muted-foreground/60">404</p>
        <h1 className="text-[22px] font-semibold text-foreground">{t('common.pageNotFound')}</h1>
        <p className="text-[15px] text-muted-foreground">{t('common.pageNotFoundHint')}</p>
        <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild className="min-h-11">
            <Link to={withLang(ROUTES.home, language)}>{t('common.goHome')}</Link>
          </Button>
          <Button asChild variant="secondary" className="min-h-11">
            <Link to={withLang(ROUTES.cars, language)}>{t('common.goCatalog')}</Link>
          </Button>
        </div>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {CATALOG_LINKS.map((item) => (
            <li key={item.to}>
              <Button asChild variant="ghost" className="min-h-11">
                <Link to={withLang(item.to, language)}>{t(item.labelKey)}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
