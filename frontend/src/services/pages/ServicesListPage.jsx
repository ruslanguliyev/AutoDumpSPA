import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FiltersPanel from '@/features/filters/components/FiltersPanel';
import { createServicesFiltersConfig } from '@/features/filters/config/services.filters';
import ServicesGrid from '@/services/components/ServicesGrid';
import { useServices } from '@/services/hooks/useServices';

export default function ServicesListPage() {
  const { t } = useTranslation('services');
  const { services, options, isLoading, error } = useServices();
  const filtersConfig = useMemo(
    () =>
      createServicesFiltersConfig({
        t,
        options,
        total: services.length,
        isLoading,
      }),
    [t, isLoading, options, services.length]
  );

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null;

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <header className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          <FiltersPanel
            domain="services"
            config={filtersConfig}
            total={services.length}
          />
        </header>

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <div className="font-semibold">{t('list.errorFailed')}</div>
            <div className="mt-1">
              {errorMessage ? <span>{errorMessage}. </span> : null}
              {t('list.errorCheckEndpoint')} <code className="rounded bg-destructive/10 px-1">VITE_GRAPHQL_ENDPOINT</code>.
            </div>
          </div>
        ) : null}

        <ServicesGrid services={services} isLoading={isLoading} />
      </div>
    </div>
  );
}
