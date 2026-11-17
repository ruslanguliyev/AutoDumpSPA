import { useTranslation } from 'react-i18next';

const RouteFallback = () => {
  const { t } = useTranslation('common');

  return (
    <div className="w-full px-4 py-10" role="status" aria-live="polite">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="rounded-2xl border border-border bg-card p-6 text-[15px] text-muted-foreground">
          {t('common.loading')}
        </div>
      </div>
    </div>
  );
};

export default RouteFallback;
