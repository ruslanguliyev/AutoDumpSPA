import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';

import { useSpecialistsFiltersUrlSync } from '@/features/filters/hooks/useSpecialistsFiltersUrlSync';
import { getDefaultFilters } from '@/features/filters/store/filters.defaults';
import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import SpecialistCard from '@/specialists/components/SpecialistCard';
import SpecialistsFilters from '@/specialists/pages/SpecialistsFilters';
import { specialistsVehicleFilterSupported } from '@/specialists/config/specialistsCatalog';
import { useSpecialists } from '@/specialists/hooks/useSpecialists';
import type { SpecialistProfile } from '@/specialists/types/specialist.types';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { IndexPage } from '@/shared/ui/IndexPage';
import type { ActiveFilterChip } from '@/shared/ui/IndexPage';
import Button from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/EmptyState';
import Skeleton from '@/shared/ui/Skeleton/Skeleton';

const PAGE_SIZE = 9;

type SortKey = 'default' | 'ratingDesc' | 'priceAsc';

const text = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

const SpecialistsListPage = () => {
  const { t } = useTranslation(['specialists', 'common']);
  const vehiclesFilterSupported = specialistsVehicleFilterSupported();
  const { specialists, isLoading, error } = useSpecialists({
    vehiclesFilterSupported,
  });
  useSpecialistsFiltersUrlSync();

  const filters = useFilters('specialists');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const resetFilters = useFiltersStore((state) => state.resetFilters);

  const [sort, setSort] = useState<SortKey>('default');

  const sorted = useMemo(() => {
    const list = [...specialists];
    if (sort === 'ratingDesc') {
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    if (sort === 'priceAsc') {
      return list.sort((a, b) => (a.priceFrom ?? Number.MAX_SAFE_INTEGER) - (b.priceFrom ?? Number.MAX_SAFE_INTEGER));
    }
    return list;
  }, [specialists, sort]);

  const viewKey = `${sort}|${JSON.stringify(filters)}`;
  const [pageState, setPageState] = useState({ key: viewKey, page: 1 });
  const page = pageState.key === viewKey ? pageState.page : 1;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const isMobilePagination = useMediaQuery('(max-width: 639px)');
  const visible = isMobilePagination
    ? sorted.slice(0, page * PAGE_SIZE)
    : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasMore = page < pageCount;

  const clearAll = () => resetFilters('specialists', getDefaultFilters('specialists'));

  const chips: ActiveFilterChip[] = [];
  const city = text(filters.city);
  if (city) chips.push({ key: 'city', label: city, onRemove: () => setFilter('specialists', 'city', '') });

  const specialization = text(filters.specialization);
  if (specialization) {
    chips.push({
      key: 'specialization',
      label: t(`specializations.${specialization}`, { defaultValue: specialization }),
      onRemove: () => setFilter('specialists', 'specialization', ''),
    });
  }

  const brand = text(filters.brand);
  if (vehiclesFilterSupported && brand) {
    chips.push({ key: 'brand', label: brand, onRemove: () => setFilter('specialists', 'brand', '') });
  }
  const minRating = text(filters.minRating);
  if (minRating) {
    chips.push({
      key: 'rating',
      label: t('index.filters.chipRatingFrom', { value: minRating }),
      onRemove: () => setFilter('specialists', 'minRating', ''),
    });
  }

  if (filters.availableNow) {
    chips.push({
      key: 'available',
      label: t('index.filters.availableNow'),
      onRemove: () => setFilter('specialists', 'availableNow', false),
    });
  }

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null;

  let gridState: ReactNode = null;
  if (isLoading && sorted.length === 0) {
    gridState = (
      <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index}>
            <Skeleton className="h-80 w-full rounded-2xl" />
          </li>
        ))}
      </ul>
    );
  } else if (error && sorted.length === 0) {
    gridState = (
      <EmptyState icon={<SearchX size={32} />}>
        <span className="font-semibold">{t('list.errorFailed')}</span>
        {errorMessage ? <span className="mt-1 block text-sm">{errorMessage}</span> : null}
      </EmptyState>
    );
  } else if (!isLoading && sorted.length === 0) {
    gridState = (
      <EmptyState
        icon={<SearchX size={32} />}
        action={
          <Button variant="secondary" onClick={clearAll}>
            {t('index.emptyAction')}
          </Button>
        }
      >
        {t('index.empty')}
      </EmptyState>
    );
  }

  return (
    <IndexPage
      breadcrumbs={[
        { label: t('index.breadcrumbs.home'), to: '/' },
        { label: t('index.breadcrumbs.specialists') },
      ]}
      title={t('index.title')}
      count={t('index.count', { count: sorted.length })}
      sort={{
        label: t('common:indexPage.sortBy'),
        value: sort,
        onChange: (value) => setSort(value as SortKey),
        options: (['default', 'ratingDesc', 'priceAsc'] as SortKey[]).map((key) => ({
          value: key,
          label: t(`index.sort.${key}`),
        })),
      }}
      filters={<SpecialistsFilters vehiclesFilterSupported={vehiclesFilterSupported} />}
      filtersLabel={t('common:indexPage.filters')}
      activeFilterCount={chips.length}
      onResetFilters={clearAll}
      activeChips={chips}
      removeChipLabel={t('common:indexPage.removeFilter')}
      drawerLabels={{
        title: t('common:indexPage.filters'),
        reset: t('common:indexPage.reset'),
        close: t('common:indexPage.close'),
        clearAll: t('common:indexPage.clearAll'),
        show: t('index.show', { count: sorted.length }),
      }}
      gridState={gridState}
      pagination={{
        page,
        pageCount,
        onPageChange: (next) => setPageState({ key: viewKey, page: Math.min(Math.max(1, next), pageCount) }),
        onLoadMore: () => setPageState({ key: viewKey, page: Math.min(page + 1, pageCount) }),
        hasMore,
        labels: {
          prev: t('common:indexPage.pagination.prev'),
          next: t('common:indexPage.pagination.next'),
          page: (n) => t('common:indexPage.pagination.page', { page: n }),
          pageOf: (current, total) =>
            t('common:indexPage.pagination.pageOf', { page: current, pageCount: total }),
          loadMore: t('common:buttons.loadMore'),
        },
      }}
    >
      {visible.map((specialist) => (
        <li key={specialist.id}>
          <SpecialistCard specialist={specialist} />
        </li>
      ))}
    </IndexPage>
  );
};

export default SpecialistsListPage;
