import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';

import { useSellersFiltersUrlSync } from '@/features/filters/hooks/useSellersFiltersUrlSync';
import { getDefaultFilters } from '@/features/filters/store/filters.defaults';
import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import SellerGridCard from '@/shared/components/SellerCard/SellerGridCard';
import SellersFilters from '@/sellers/pages/SellersFilters';
import { useSellers } from '@/sellers/hooks/useSellers';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { IndexPage } from '@/shared/ui/IndexPage';
import type { ActiveFilterChip } from '@/shared/ui/IndexPage';
import Button from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/EmptyState';
import Skeleton from '@/shared/ui/Skeleton/Skeleton';
import { normalizeSellerType } from '@/shared/utils/sellerType';

const PAGE_SIZE = 9;
const SELLER_ROUTE_PREFIX = '/sellers';

type SortKey = 'rating' | 'listings' | 'newest' | 'az';

const text = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

export default function SellersPage() {
  const { t } = useTranslation(['sellers', 'common']);
  const navigate = useNavigate();
  useSellersFiltersUrlSync();

  const filters = useFilters('sellers');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const resetFilters = useFiltersStore((state) => state.resetFilters);

  const { filteredSellers, filterOptions, isLoading } = useSellers();
  const toolbarSort = String(filters.sort || 'rating') as SortKey;

  const sorted = useMemo(() => {
    const list = [...filteredSellers];
    switch (toolbarSort) {
      case 'listings':
        return list.sort(
          (a, b) => (Number(b.listingsCount) || 0) - (Number(a.listingsCount) || 0)
        );
      case 'az':
        return list.sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
      case 'newest':
        return list.sort((a, b) => {
          const aDate = a.memberSince ? Date.parse(String(a.memberSince)) : 0;
          const bDate = b.memberSince ? Date.parse(String(b.memberSince)) : 0;
          return bDate - aDate;
        });
      case 'rating':
      default:
        return list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }
  }, [filteredSellers, toolbarSort]);

  const viewKey = `${toolbarSort}|${JSON.stringify(filters)}`;
  const [pageState, setPageState] = useState({ key: viewKey, page: 1 });
  const page = pageState.key === viewKey ? pageState.page : 1;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const isMobilePagination = useMediaQuery('(max-width: 639px)');
  const visible = isMobilePagination
    ? sorted.slice(0, page * PAGE_SIZE)
    : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasMore = page < pageCount;

  const clearAll = () => resetFilters('sellers', getDefaultFilters('sellers'));

  const chips: ActiveFilterChip[] = [];
  const search = text(filters.search);
  if (search) chips.push({ key: 'search', label: search, onRemove: () => setFilter('sellers', 'search', '') });

  const sellerType = text(filters.sellerType);
  if (sellerType) {
    const key = normalizeSellerType(sellerType);
    chips.push({
      key: 'type',
      label: key ? t(`filters.sellerTypeOptions.${key}`) : sellerType,
      onRemove: () => setFilter('sellers', 'sellerType', ''),
    });
  }

  const city = text(filters.city);
  if (city) chips.push({ key: 'city', label: city, onRemove: () => setFilter('sellers', 'city', '') });

  if (filters.verifiedOnly) {
    chips.push({
      key: 'verified',
      label: t('filters.verifiedOnly'),
      onRemove: () => setFilter('sellers', 'verifiedOnly', false),
    });
  }

  let gridState: ReactNode = null;
  if (isLoading && sorted.length === 0) {
    gridState = (
      <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index}>
            <Skeleton className="h-72 w-full rounded-2xl" />
          </li>
        ))}
      </ul>
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
        {t('list.empty')}
      </EmptyState>
    );
  }

  return (
    <IndexPage
      breadcrumbs={[
        { label: t('index.breadcrumbs.home'), to: '/' },
        { label: t('index.breadcrumbs.sellers') },
      ]}
      title={t('index.title')}
      count={t('index.count', { count: sorted.length })}
      sort={{
        label: t('indexPage.sortBy', { ns: 'common' }),
        value: toolbarSort,
        onChange: (value) => setFilter('sellers', 'sort', value),
        options: filterOptions.sorts.map((option) => ({ value: String(option.value), label: option.label })),
      }}
      filters={
        <SellersFilters
          cities={[{ value: '', label: t('filters.cityOptions.any') }, ...filterOptions.cities]}
        />
      }
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
          prev: t('indexPage.pagination.prev', { ns: 'common' }),
          next: t('indexPage.pagination.next', { ns: 'common' }),
          page: (n) => t('indexPage.pagination.page', { ns: 'common', page: n }),
          pageOf: (current, total) =>
            t('indexPage.pagination.pageOf', { ns: 'common', page: current, pageCount: total }),
          loadMore: t('buttons.loadMore', { ns: 'common' }),
        },
      }}
    >
      {visible.map((seller) => (
        <li key={seller.id}>
          <SellerGridCard seller={seller} onClick={() => navigate(`${SELLER_ROUTE_PREFIX}/${seller.id}`)} />
        </li>
      ))}
    </IndexPage>
  );
}
