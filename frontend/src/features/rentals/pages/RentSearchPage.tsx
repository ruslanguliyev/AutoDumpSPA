import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';

import { useRentFiltersUrlSync } from '@/features/filters/hooks/useRentFiltersUrlSync';
import { getDefaultFilters } from '@/features/filters/store/filters.defaults';
import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import RentFilters from '@/features/rentals/pages/RentFilters';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { IndexPage } from '@/shared/ui/IndexPage';
import type { ActiveFilterChip } from '@/shared/ui/IndexPage';
import Button from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/EmptyState';
import Skeleton from '@/shared/ui/Skeleton/Skeleton';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { RENT_CATALOG_LIMIT } from '@/shared/constants/catalogLimits';
import { getVehicles } from '@/vehicles/api/vehicles.api';
import AutoCard from '@/vehicles/components/AutoCardComponent/AutoCard.jsx';

const PAGE_SIZE = 9;

type RentalVehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number | null;
  currency: string;
  location: string | null;
  bodyType: string | null;
  image: string[];
  rental: { deposit: number | null; minDays: number; maxDays: number | null; kmPerDay: number | null } | null;
};

type SortKey = 'default' | 'priceAsc' | 'priceDesc';

const byPrice =
  (direction: 1 | -1) => (a: RentalVehicle, b: RentalVehicle) => {
    const left = a.price;
    const right = b.price;
    if (left == null && right == null) return 0;
    if (left == null) return 1;
    if (right == null) return -1;
    return (left - right) * direction;
  };

const SORTERS: Record<Exclude<SortKey, 'default'>, (a: RentalVehicle, b: RentalVehicle) => number> = {
  priceAsc: byPrice(1),
  priceDesc: byPrice(-1),
};

const text = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

function RentalCard({ car }: { car: RentalVehicle }) {
  return <AutoCard car={{ ...car, image: resolveMediaUrl(car.image?.[0]) }} variant="rent" />;
}

/** Public catalogue of cars for rent on the shared index skeleton. */
export default function RentSearchPage() {
  const { t } = useTranslation(['vehicle', 'common', 'addItem', 'dashboard']);
  useRentFiltersUrlSync();

  const filters = useFilters('rent');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const resetFilters = useFiltersStore((state) => state.resetFilters);

  const [sort, setSort] = useState<SortKey>('default');

  const from = text(filters.availableFrom);
  const to = text(filters.availableTo);
  const city = text(filters.city);
  const periodInvalid = Boolean(from && to && to < from);
  const period = from && to && to >= from ? { availableFrom: from, availableTo: to } : {};

  const query = useQuery({
    queryKey: ['rent-search', city, period],
    queryFn: () =>
      getVehicles({ purpose: 'RENT', city, limit: RENT_CATALOG_LIMIT, ...period }) as Promise<
        RentalVehicle[]
      >,
    enabled: !periodInvalid,
    placeholderData: keepPreviousData,
  });

  const fetched = query.data ?? [];
  const pricePerDaySupported = !query.isLoading && fetched.length < RENT_CATALOG_LIMIT;

  const cars = useMemo(() => {
    let list = fetched;
    if (!pricePerDaySupported) return list;
    const priceFrom = filters.priceFrom != null ? Number(filters.priceFrom) : null;
    const priceTo = filters.priceTo != null ? Number(filters.priceTo) : null;
    if (Number.isFinite(priceFrom) && priceFrom != null) {
      list = list.filter((car) => car.price != null && car.price >= priceFrom);
    }
    if (Number.isFinite(priceTo) && priceTo != null) {
      list = list.filter((car) => car.price != null && car.price <= priceTo);
    }
    return list;
  }, [fetched, filters.priceFrom, filters.priceTo, pricePerDaySupported]);

  const hasPriceDayFilter = Boolean(text(filters.priceFrom) || text(filters.priceTo));
  const showResultCount = !(hasPriceDayFilter && !pricePerDaySupported);

  const sorted = useMemo(
    () => (sort === 'default' ? cars : [...cars].sort(SORTERS[sort])),
    [cars, sort]
  );

  const viewKey = `${sort}|${JSON.stringify(filters)}`;
  const [pageState, setPageState] = useState({ key: viewKey, page: 1 });
  const page = pageState.key === viewKey ? pageState.page : 1;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const isMobilePagination = useMediaQuery('(max-width: 639px)');
  const visible = isMobilePagination
    ? sorted.slice(0, page * PAGE_SIZE)
    : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasMore = page < pageCount;

  const clearAll = () => resetFilters('rent', getDefaultFilters('rent'));

  const chips: ActiveFilterChip[] = [];
  const range = (label: string, fromValue: unknown, toValue: unknown) => {
    const a = text(fromValue);
    const b = text(toValue);
    if (a && b) return t('index.filters.chipRange', { label, from: a, to: b });
    if (a) return t('index.filters.chipFrom', { label, value: a });
    if (b) return t('index.filters.chipTo', { label, value: b });
    return '';
  };

  if (periodInvalid) {
    chips.push({
      key: 'dates-invalid',
      label: t('rentIndex.invalidDateRange'),
      onRemove: () => setFilters('rent', { availableFrom: '', availableTo: '' }),
    });
  } else if (from || to) {
    const label =
      from && to
        ? t('index.filters.chipRange', {
            label: t('rentIndex.filters.availability'),
            from,
            to,
          })
        : from
          ? t('index.filters.chipFrom', { label: t('rentIndex.filters.availability'), value: from })
          : t('index.filters.chipTo', { label: t('rentIndex.filters.availability'), value: to });
    chips.push({
      key: 'dates',
      label,
      onRemove: () => setFilters('rent', { availableFrom: '', availableTo: '' }),
    });
  }

  const priceLabel = pricePerDaySupported
    ? range(t('rentIndex.filters.pricePerDay'), filters.priceFrom, filters.priceTo)
    : '';
  if (priceLabel) {
    chips.push({
      key: 'price',
      label: priceLabel,
      onRemove: () => setFilters('rent', { priceFrom: null, priceTo: null }),
    });
  }

  if (city) {
    chips.push({
      key: 'city',
      label: city,
      onRemove: () => setFilter('rent', 'city', ''),
    });
  }

  let gridState: ReactNode = null;
  if (periodInvalid) {
    gridState = (
      <EmptyState icon={<SearchX size={32} />}>
        {t('rentIndex.invalidDateRange')}
      </EmptyState>
    );
  } else if (query.isLoading && cars.length === 0) {
    gridState = (
      <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index}>
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          </li>
        ))}
      </ul>
    );
  } else if (!query.isLoading && sorted.length === 0) {
    gridState = (
      <EmptyState
        icon={<SearchX size={32} />}
        action={
          <Button variant="secondary" onClick={clearAll}>
            {t('rentIndex.emptyAction')}
          </Button>
        }
      >
        {t('rentIndex.empty')}
      </EmptyState>
    );
  }

  return (
    <IndexPage
      breadcrumbs={[
        { label: t('breadcrumbs.home'), to: '/' },
        { label: t('breadcrumbs.rent') },
      ]}
      title={t('rentIndex.title')}
      count={showResultCount ? t('rentIndex.count', { count: sorted.length }) : null}
      sort={{
        label: t('indexPage.sortBy', { ns: 'common' }),
        value: sort,
        onChange: (value) => setSort(value as SortKey),
        options: (['default', 'priceAsc', 'priceDesc'] as SortKey[]).map((key) => ({
          value: key,
          label: t(`rentIndex.sort.${key}`),
        })),
      }}
      filters={<RentFilters pricePerDaySupported={pricePerDaySupported} />}
      filtersLabel={t('indexPage.filters', { ns: 'common' })}
      activeFilterCount={chips.length}
      onResetFilters={clearAll}
      activeChips={chips}
      removeChipLabel={t('indexPage.removeFilter', { ns: 'common' })}
      above={
        periodInvalid ? (
          <p role="alert" className="mb-6 text-[14px] text-destructive">
            {t('rentIndex.invalidDateRange')}
          </p>
        ) : null
      }
      drawerLabels={{
        title: t('indexPage.filters', { ns: 'common' }),
        reset: t('indexPage.reset', { ns: 'common' }),
        close: t('indexPage.close', { ns: 'common' }),
        clearAll: t('indexPage.clearAll', { ns: 'common' }),
        show: t('rentIndex.show', { count: sorted.length }),
      }}
      gridState={gridState}
      pagination={{
        page,
        pageCount,
        onPageChange: (next) => setPageState({ key: viewKey, page: Math.min(Math.max(1, next), pageCount) }),
        onLoadMore: () => setPageState({ key: viewKey, page: Math.min(page + 1, pageCount) }),
        hasMore,
        labels: {
          prev: t('indexPage.pagination.prev', { ns: 'common' }),
          next: t('indexPage.pagination.next', { ns: 'common' }),
          page: (n) => t('indexPage.pagination.page', { ns: 'common', page: n }),
          pageOf: (current, total) =>
            t('indexPage.pagination.pageOf', { ns: 'common', page: current, pageCount: total }),
          loadMore: t('buttons.loadMore', { ns: 'common' }),
        },
      }}
    >
      {visible.map((car) => (
        <li key={car.id}>
          <RentalCard car={car} />
        </li>
      ))}
    </IndexPage>
  );
}
