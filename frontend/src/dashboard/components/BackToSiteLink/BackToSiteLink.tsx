import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import clsx from 'clsx';

import { ROUTES, withLang } from '@/shared/constants/routes';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';

type BackToSiteLinkProps = {
  surface: 'sidebar' | 'topbar';
  iconOnly?: boolean;
  className?: string;
};

const focusClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function BackToSiteLink({ surface, iconOnly = false, className }: BackToSiteLinkProps) {
  const { t } = useTranslation('dashboard');
  const { language } = useLanguageSync();
  const label = t('backToSite');

  return (
    <Link
      to={withLang(ROUTES.home, language)}
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg text-sm font-medium no-underline transition-colors',
        iconOnly ? 'px-0' : 'px-3',
        focusClass,
        surface === 'sidebar'
          ? 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        className,
      )}
    >
      <Home size={18} aria-hidden />
      {!iconOnly ? <span>{label}</span> : null}
    </Link>
  );
}

export function BrandHomeLink({
  className,
  children = 'AvtoBaz',
}: {
  className?: string;
  children?: string;
}) {
  const { t } = useTranslation('dashboard');
  const { language } = useLanguageSync();
  const label = t('backToSite');

  return (
    <Link
      to={withLang(ROUTES.home, language)}
      aria-label={label}
      title={label}
      className={clsx(
        'rounded-lg text-sm font-semibold no-underline transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {children}
    </Link>
  );
}
