import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FiltersPanel from '@/features/filters/components/FiltersPanel';
import { createPartsFiltersConfig } from '@/features/filters/config/parts.filters';
import PartCard from '@/parts/components/PartCard/PartCard.jsx';
import { useParts } from '@/parts/hooks/useParts';

const PartsPage = () => {
  const { t } = useTranslation('part');
  const { parts, total, isLoading, error, selectOptions } = useParts();

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : null;

  const filterOptions = useMemo(
    () => ({
      ...selectOptions,
    }),
    [selectOptions]
  );

  const filtersConfig = useMemo(
    () =>
      createPartsFiltersConfig({
        t,
        options: filterOptions,
        total,
        isLoading,
      }),
    [filterOptions, isLoading, t, total]
  );

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
      

        <FiltersPanel domain="parts" config={filtersConfig} total={total} />

        {error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <div className="font-semibold">{t('list.failedToLoad')}</div>
            <div className="mt-1">
              {errorMessage ? <span>{errorMessage}. </span> : null}
              {t('list.errorMessage')}
            </div>
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {isLoading && parts.length === 0 ? (
            <div className="col-span-full text-sm text-muted-foreground">{t('list.loadingInventory')}</div>
          ) : null}

          {!isLoading && parts.length === 0 ? (
            <div className="col-span-full rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
              {t('list.noResultsMatch')}
            </div>
          ) : null}

          {parts.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </section>
      </div>
    </div>
  );
};

export default PartsPage;
