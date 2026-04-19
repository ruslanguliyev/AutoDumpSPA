import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import FiltersPanel from '@/features/filters/components/FiltersPanel';
import { createSpecialistsFiltersConfig } from '@/features/filters/config/specialists.filters';
import { useSpecialistsFiltersUrlSync } from '@/features/filters/hooks/useSpecialistsFiltersUrlSync';
import SpecialistCard from '@/specialists/components/SpecialistCard';
import { useSpecialists } from '@/specialists/hooks/useSpecialists';

const SpecialistsListPage = () => {
  const { t } = useTranslation('specialists');
  const { specialists, isLoading, error } = useSpecialists();
  useSpecialistsFiltersUrlSync();

  const total = specialists.length;

  const filtersConfig = useMemo(
    () =>
      createSpecialistsFiltersConfig({
        t,
        total,
        isLoading,
      }),
    [t, total, isLoading]
  );

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null;

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <header className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>

          <FiltersPanel domain="specialists" config={filtersConfig} total={total} />
        </header>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <div className="font-semibold">{t('list.errorFailed')}</div>
            <div className="mt-1">
              {errorMessage ? <span>{errorMessage}. </span> : null}
              {t('list.errorCheckEndpoint')}{' '}
              <code className="rounded bg-destructive/10 px-1">VITE_GRAPHQL_ENDPOINT</code>.
            </div>
          </div>
        ) : null}

        {isLoading && specialists.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
            {t('list.loading')}
          </div>
        ) : !isLoading && specialists.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
            {t('list.empty')}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {specialists.map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialistsListPage;
