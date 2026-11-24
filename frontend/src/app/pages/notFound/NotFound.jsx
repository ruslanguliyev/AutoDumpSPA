import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

import { ROUTES, withLang } from '@/shared/constants/routes';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import Button from '@/shared/ui/button';
import { Chip } from '@/shared/ui/Chip';
import { Input } from '@/shared/ui/Input';

const CATALOG_LINKS = [
  { to: ROUTES.cars, labelKey: 'nav.cars' },
  { to: ROUTES.rent, labelKey: 'nav.rent' },
  { to: ROUTES.parts, labelKey: 'nav.parts' },
  { to: ROUTES.services, labelKey: 'nav.auto_services' },
  { to: ROUTES.specialists, labelKey: 'nav.specialists' },
  { to: ROUTES.sellers, labelKey: 'nav.sellers' },
];

/**
 * Catch-all route. The search field goes to the parts catalogue (`/parts?q=`), the only index
 * with a free-text search by name or OEM; the six chips cover the other catalogues.
 */
export default function NotFound() {
  const { t } = useTranslation('common');
  const { language } = useLanguageSync();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  useDocumentTitle(t('common.pageNotFound'));

  const onSearch = (event) => {
    event.preventDefault();
    const typed = query.trim();
    const base = withLang(ROUTES.parts, language);
    navigate(typed ? `${base}?q=${encodeURIComponent(typed)}` : base);
  };

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-12 sm:py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <p
          aria-hidden="true"
          className="text-[96px] font-bold leading-none tracking-tight text-subtle-foreground sm:text-[128px]"
        >
          404
        </p>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[30px]">
          {t('common.pageNotFound')}
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
          {t('common.pageNotFoundHint')}
        </p>

        <form onSubmit={onSearch} role="search" className="mt-2 flex w-full items-end gap-2 text-left">
          <Input
            type="search"
            label={t('common.pageNotFoundSearch')}
            wrapperClassName="min-w-0 flex-1"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button type="submit" variant="primary" size="icon" aria-label={t('buttons.search')}>
            <Search size={20} aria-hidden="true" />
          </Button>
        </form>

        <Button asChild variant="primary" className="w-full sm:w-auto">
          <Link to={withLang(ROUTES.home, language)}>{t('common.goHome')}</Link>
        </Button>

        <ul className="mt-2 flex list-none flex-wrap justify-center gap-2 p-0">
          {CATALOG_LINKS.map((item) => (
            <li key={item.to}>
              <Chip asChild>
                <Link to={withLang(item.to, language)}>{t(item.labelKey)}</Link>
              </Chip>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
