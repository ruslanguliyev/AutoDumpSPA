import { useMemo, useState } from 'react';

import { ROUTES, withLang } from '@/shared/constants/routes';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { usePageHead } from '@/shared/hooks/usePageHead';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';

import AutoCard from '@/vehicles/components/AutoCardComponent/AutoCard';
import { useAutos } from '@/vehicles/hooks/useAutos';
import { PromotedVehicles } from '@/features/promotions/components/PromotedVehicles';
import { useCarsFiltersUrlSync } from '@/features/filters/hooks/useCarsFiltersUrlSync';
import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import { getDefaultFilters } from '@/features/filters/store/filters.defaults';
import { IndexPage } from '@/shared/ui/IndexPage';
import type { ActiveFilterChip } from '@/shared/ui/IndexPage';
import Button from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/EmptyState';
import Skeleton from '@/shared/ui/Skeleton/Skeleton';
import { translateVehicleEnum } from '@/lib/vehicleEnumLabels';
import CarsFilters from './CarsFilters';

const PAGE_SIZE = 9;

type Car = {
  id: string;
  price: number | null;
  year: number | null;
  mileage: number | null;
};

type SortKey = 'default' | 'priceAsc' | 'priceDesc' | 'yearDesc' | 'mileageAsc';

/** Cars without the field go last in either direction; a missing number is not a zero. */
const byNumber =
  (pick: (car: Car) => number | null, direction: 1 | -1) => (a: Car, b: Car) => {
    const left = pick(a);
    const right = pick(b);
    if (left == null && right == null) return 0;
    if (left == null) return 1;
    if (right == null) return -1;
    return (left - right) * direction;
  };

const SORTERS: Record<Exclude<SortKey, 'default'>, (a: Car, b: Car) => number> = {
  priceAsc: byNumber((car) => car.price, 1),
  priceDesc: byNumber((car) => car.price, -1),
  yearDesc: byNumber((car) => car.year, -1),
  mileageAsc: byNumber((car) => car.mileage, 1),
};

const asList = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);
const text = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

export default function AutoSearchResults() {
  const { t } = useTranslation(['vehicle', 'common']);
  const { language } = useLanguageSync();
  const { autos, isLoading, catalogComplete } = useAutos();
  useCarsFiltersUrlSync();
  usePageHead({
    title: t('nav.cars', { ns: 'common' }),
    canonicalPath: withLang(ROUTES.cars, language),
  });

  const filters = useFilters('cars');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const toggleFilterValue = useFiltersStore((state) => state.toggleFilterValue);
  const resetFilters = useFiltersStore((state) => state.resetFilters);

  const [sort, setSort] = useState<SortKey>('default');

  const cars = autos as Car[];
  const hasClientRangeFilter = Boolean(
    text(filters.priceFrom) ||
      text(filters.priceTo) ||
      text(filters.yearFrom) ||
      text(filters.yearTo)
  );
  const showResultCount = !(hasClientRangeFilter && !catalogComplete);
  const sorted = useMemo(
    () => (sort === 'default' ? cars : [...cars].sort(SORTERS[sort])),
    [cars, sort]
  );

  // The page belongs to one filter + sort combination; a new combination starts on page 1.
  const viewKey = `${sort}|${JSON.stringify(filters)}`;
  const [pageState, setPageState] = useState({ key: viewKey, page: 1 });
  const page = pageState.key === viewKey ? pageState.page : 1;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const isMobilePagination = useMediaQuery('(max-width: 639px)');
  const visible = isMobilePagination
    ? sorted.slice(0, page * PAGE_SIZE)
    : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasMore = page < pageCount;

  const clearAll = () => resetFilters('cars', getDefaultFilters('cars'));

  const chips: ActiveFilterChip[] = [];
  const brand = text(filters.brand);
  const model = text(filters.model);
  const city = text(filters.city);
  if (brand) chips.push({ key: 'brand', label: brand, onRemove: () => setFilters('cars', { brand: '', model: '' }) });
  if (model) chips.push({ key: 'model', label: model, onRemove: () => setFilter('cars', 'model', '') });
  if (city) chips.push({ key: 'city', label: city, onRemove: () => setFilter('cars', 'city', '') });

  const range = (label: string, from: unknown, to: unknown) => {
    const a = text(from);
    const b = text(to);
    if (a && b) return t('index.filters.chipRange', { label, from: a, to: b });
    if (a) return t('index.filters.chipFrom', { label, value: a });
    if (b) return t('index.filters.chipTo', { label, value: b });
    return '';
  };
  const priceLabel = range(t('index.filters.price'), filters.priceFrom, filters.priceTo);
  if (priceLabel) {
    chips.push({
      key: 'price',
      label: priceLabel,
      onRemove: () => setFilters('cars', { priceFrom: null, priceTo: null }),
    });
  }
  const yearLabel = range(t('index.filters.year'), filters.yearFrom, filters.yearTo);
  if (yearLabel) {
    chips.push({
      key: 'year',
      label: yearLabel,
      onRemove: () => setFilters('cars', { yearFrom: null, yearTo: null }),
    });
  }
  asList(filters.transmission).forEach((value) =>
    chips.push({
      key: `transmission-${value}`,
      label: translateVehicleEnum(t, 'transmission', value) ?? value,
      onRemove: () => toggleFilterValue('cars', 'transmission', value),
    })
  );
  asList(filters.fuel).forEach((value) =>
    chips.push({
      key: `fuel-${value}`,
      label: translateVehicleEnum(t, 'fuel', value) ?? value,
      onRemove: () => toggleFilterValue('cars', 'fuel', value),
    })
  );

  let gridState: ReactNode = null;
  if (isLoading && cars.length === 0) {
    gridState = (
      <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index}>
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          </li>
        ))}
      </ul>
    );
  } else if (cars.length === 0) {
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
        { label: t('breadcrumbs.home'), to: '/' },
        { label: t('breadcrumbs.cars') },
      ]}
      title={t('index.title')}
      count={showResultCount ? t('index.count', { count: cars.length }) : null}
      sort={{
        label: t('indexPage.sortBy', { ns: 'common' }),
        value: sort,
        onChange: (value) => setSort(value as SortKey),
        options: (['default', 'priceAsc', 'priceDesc', 'yearDesc', 'mileageAsc'] as SortKey[]).map((key) => ({
          value: key,
          label: t(`index.sort.${key}`),
        })),
      }}
      filters={<CarsFilters clientRangeFiltersSupported={catalogComplete} />}
      filtersLabel={t('indexPage.filters', { ns: 'common' })}
      activeFilterCount={chips.length}
      onResetFilters={clearAll}
      activeChips={chips}
      removeChipLabel={t('indexPage.removeFilter', { ns: 'common' })}
      drawerLabels={{
        title: t('indexPage.filters', { ns: 'common' }),
        reset: t('indexPage.reset', { ns: 'common' }),
        close: t('indexPage.close', { ns: 'common' }),
        clearAll: t('indexPage.clearAll', { ns: 'common' }),
        show: t('index.showCars', { count: cars.length }),
      }}
      // Paid placement stays apart from the ranked results and labelled as an advert.
      above={<PromotedVehicles tier="VIP" limit={4} className="!pt-0 !pb-8" />}
      gridState={gridState}
      pagination={{
        page,
        pageCount,
        onPageChange: (next) => setPageState({ key: viewKey, page: Math.min(Math.max(1, next), pageCount) }),
        onLoadMore: () =>
          setPageState({ key: viewKey, page: Math.min(page + 1, pageCount) }),
        hasMore,
        labels: {
          prev: t('indexPage.pagination.prev', { ns: 'common' }),
          next: t('indexPage.pagination.next', { ns: 'common' }),
          page: (n) => t('indexPage.pagination.page', { ns: 'common', page: n }),
          pageOf: (current, total) => t('indexPage.pagination.pageOf', { ns: 'common', page: current, pageCount: total }),
          loadMore: t('buttons.loadMore', { ns: 'common' }),
        },
      }}
    >
      {visible.map((car) => (
        <li key={car.id}>
          <AutoCard car={car} />
        </li>
      ))}
    </IndexPage>
  );
}
