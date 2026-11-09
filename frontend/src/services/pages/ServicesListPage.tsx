import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';

import { useServicesFiltersUrlSync } from '@/features/filters/hooks/useServicesFiltersUrlSync';
import { getDefaultFilters } from '@/features/filters/store/filters.defaults';
import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import type { FilterValue } from '@/features/filters/types/filters.types';
import ServiceCard from '@/services/components/ServiceCard';
import ServicesFilters from '@/services/pages/ServicesFilters';
import { useServices } from '@/services/hooks/useServices';
import type { ServiceProfile } from '@/services/types/service.types';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { IndexPage } from '@/shared/ui/IndexPage';
import type { ActiveFilterChip } from '@/shared/ui/IndexPage';
import Button from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/EmptyState';
import Skeleton from '@/shared/ui/Skeleton/Skeleton';

const PAGE_SIZE = 9;

type SortKey = 'default' | 'ratingDesc';

const asList = (value: FilterValue): string[] => (Array.isArray(value) ? value.map(String) : []);
const text = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

export default function ServicesListPage() {
  const { t } = useTranslation(['services', 'common']);
  useServicesFiltersUrlSync();

  const filters = useFilters('services');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const resetFilters = useFiltersStore((state) => state.resetFilters);
  const toggleFilterValue = useFiltersStore((state) => state.toggleFilterValue);

  const { services, options, isLoading, error } = useServices();
  const [sort, setSort] = useState<SortKey>('default');

  const sorted = useMemo(() => {
    const list = [...services] as ServiceProfile[];
    if (sort === 'ratingDesc') {
      return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }
    return list.sort((a, b) => {
      const promotedOrder = { premium: 3, boosted: 2, none: 1 } as const;
      const aPromoted = promotedOrder[a.promotedLevel as keyof typeof promotedOrder] || 1;
      const bPromoted = promotedOrder[b.promotedLevel as keyof typeof promotedOrder] || 1;
      if (aPromoted !== bPromoted) return bPromoted - aPromoted;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }, [services, sort]);

  const viewKey = `${sort}|${JSON.stringify(filters)}`;
  const [pageState, setPageState] = useState({ key: viewKey, page: 1 });
  const page = pageState.key === viewKey ? pageState.page : 1;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const isMobilePagination = useMediaQuery('(max-width: 639px)');
  const visible = isMobilePagination
    ? sorted.slice(0, page * PAGE_SIZE)
    : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasMore = page < pageCount;

  const clearAll = () => resetFilters('services', getDefaultFilters('services'));

  const chips: ActiveFilterChip[] = [];
  const city = text(filters.city);
  if (city) chips.push({ key: 'city', label: city, onRemove: () => setFilter('services', 'city', '') });

  asList(filters.serviceTypes).forEach((value) =>
    chips.push({
      key: `type-${value}`,
      label: t(`filters.serviceTypes.${value}`),
      onRemove: () => toggleFilterValue('services', 'serviceTypes', value),
    })
  );

  asList(filters.brands).forEach((value) =>
    chips.push({
      key: `brand-${value}`,
      label: value,
      onRemove: () => toggleFilterValue('services', 'brands', value),
    })
  );

  const ratingFrom = text(filters.ratingFrom);
  if (ratingFrom) {
    chips.push({
      key: 'rating',
      label: t('index.filters.chipRatingFrom', { value: ratingFrom }),
      onRemove: () => setFilter('services', 'ratingFrom', ''),
    });
  }

  if (filters.verifiedOnly) {
    chips.push({
      key: 'verified',
      label: t('index.filters.verifiedOnly'),
      onRemove: () => setFilter('services', 'verifiedOnly', false),
    });
  }

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null;

  let gridState: ReactNode = null;
  if (isLoading && sorted.length === 0) {
    gridState = (
      <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index}>
            <Skeleton className="aspect-video w-full rounded-2xl" />
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
        { label: t('index.breadcrumbs.services') },
      ]}
      title={t('index.title')}
      count={t('index.count', { count: sorted.length })}
      sort={{
        label: t('common:indexPage.sortBy'),
        value: sort,
        onChange: (value) => setSort(value as SortKey),
        options: (['default', 'ratingDesc'] as SortKey[]).map((key) => ({
          value: key,
          label: t(`index.sort.${key}`),
        })),
      }}
      filters={<ServicesFilters brands={options.brands} />}
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
      {visible.map((service) => (
        <li key={service.id}>
          <ServiceCard service={service} />
        </li>
      ))}
    </IndexPage>
  );
}
