import { useMemo } from 'react';
import FiltersPanel from '@/features/filters/components/FiltersPanel';
import { createServicesFiltersConfig } from '@/features/filters/config/services.filters';
import ServicesGrid from '@/services/components/ServicesGrid';
import { useServices } from '@/services/hooks/useServices';

export default function ServicesListPage() {
  const { services, options, isLoading, error } = useServices();
  const filtersConfig = useMemo(
    () =>
      createServicesFiltersConfig({
        options,
        total: services.length,
        isLoading,
      }),
    [isLoading, options, services.length]
  );

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null;

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <header className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Auto Services</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Find professional automotive services near you
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
            <div className="font-semibold">Failed to load services.</div>
            <div className="mt-1">
              {errorMessage ? <span>{errorMessage}. </span> : null}
              Check <code className="rounded bg-destructive/10 px-1">VITE_GRAPHQL_ENDPOINT</code>.
            </div>
          </div>
        ) : null}

        <ServicesGrid services={services} isLoading={isLoading} />
      </div>
    </div>
  );
}
