import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export default function NotFound() {
  const { t } = useTranslation('common');
  useDocumentTitle(t('common.pageNotFound'));

  return (
    <div className="w-full px-4 py-16">
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 text-center">
        <p className="text-6xl font-bold tracking-tight text-muted-foreground/60">404</p>
        <h1 className="text-2xl font-semibold text-foreground">{t('common.pageNotFound')}</h1>
        <p className="text-sm text-muted-foreground">{t('common.pageNotFoundHint')}</p>
        <Link
          to="/"
          className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
        >
          {t('common.goHome')}
        </Link>
      </div>
    </div>
  );
}
