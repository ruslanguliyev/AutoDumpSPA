import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';

import { usePartsFiltersUrlSync } from '@/features/filters/hooks/usePartsFiltersUrlSync';
import { getDefaultFilters } from '@/features/filters/store/filters.defaults';
import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import { CATEGORY_SLUG_TO_VALUE } from '@/parts/config/categorySlugMap';
import PartCard from '@/parts/components/PartCard/PartCard.jsx';
import PartsFilters from '@/parts/pages/PartsFilters';
import { useParts } from '@/parts/hooks/useParts';
import { getPartCategoryI18nKey } from '@/parts/utils/partCategoryLabel';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { IndexPage } from '@/shared/ui/IndexPage';
import type { ActiveFilterChip } from '@/shared/ui/IndexPage';
import Button from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/EmptyState';
import Skeleton from '@/shared/ui/Skeleton/Skeleton';

const PAGE_SIZE = 9;

type PartRow = {
  id: string;
  stock?: number;
  inStock?: boolean;
};

type SortKey = 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST';

const text = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

export default function PartsPage() {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const setFilter = useFiltersStore((s) => s.setFilter);
  const setFilters = useFiltersStore((s) => s.setFilters);
  const resetFilters = useFiltersStore((s) => s.resetFilters);

  useEffect(() => {
    if (categoryFromUrl) {
      const value = CATEGORY_SLUG_TO_VALUE[categoryFromUrl] ?? categoryFromUrl;
      setFilter('parts', 'category', value);
    }
  }, [categoryFromUrl, setFilter]);

  const { t } = useTranslation(['part', 'common']);
  usePartsFiltersUrlSync();

  const filters = useFilters('parts');
  const { parts, total, isLoading, error, selectOptions } = useParts();

  const toolbarSort = String(filters.sort || 'RELEVANCE') as SortKey;
  const inStockSupported = !isLoading && parts.length >= total;
  const showResultCount = !(filters.inStockOnly && !inStockSupported);

  const filteredParts = useMemo(() => {
    if (!filters.inStockOnly || !inStockSupported) return parts;
    return parts.filter((part: PartRow) => {
      const stock = Number.isFinite(part.stock) ? part.stock : null;
      if (stock !== null) return stock > 0;
      return Boolean(part.inStock);
    });
  }, [filters.inStockOnly, inStockSupported, parts]);

  const viewKey = `${toolbarSort}|${JSON.stringify(filters)}`;
  const [pageState, setPageState] = useState({ key: viewKey, page: 1 });
  const page = pageState.key === viewKey ? pageState.page : 1;
  const pageCount = Math.max(1, Math.ceil(filteredParts.length / PAGE_SIZE));
  const isMobilePagination = useMediaQuery('(max-width: 639px)');
  const visible = isMobilePagination
    ? filteredParts.slice(0, page * PAGE_SIZE)
    : filteredParts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasMore = page < pageCount;

  const clearAll = () => resetFilters('parts', getDefaultFilters('parts'));

  const chips: ActiveFilterChip[] = [];
  const search = text(filters.search);
  if (search) {
    chips.push({ key: 'search', label: search, onRemove: () => setFilter('parts', 'search', '') });
  }

  const category = text(filters.category);
  if (category) {
    const key = getPartCategoryI18nKey(category);
    chips.push({
      key: 'category',
      label: key ? t(`categories.${key}`, { defaultValue: category }) : category,
      onRemove: () => setFilter('parts', 'category', ''),
    });
  }

  const brand = text(filters.brand);
  if (brand) {
    chips.push({ key: 'brand', label: brand, onRemove: () => setFilters('parts', { brand: '', model: '' }) });
  }

  const condition = text(filters.condition);
  if (condition) {
    chips.push({
      key: 'condition',
      label: t(`filter.${condition}`, { defaultValue: condition }),
      onRemove: () => setFilter('parts', 'condition', ''),
    });
  }

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
      onRemove: () => setFilters('parts', { priceFrom: '', priceTo: '' }),
    });
  }

  const location = text(filters.location);
  if (location) {
    chips.push({ key: 'city', label: location, onRemove: () => setFilter('parts', 'location', '') });
  }

  if (inStockSupported && filters.inStockOnly) {
    chips.push({
      key: 'inStock',
      label: t('index.filters.inStockOnly'),
      onRemove: () => setFilter('parts', 'inStockOnly', false),
    });
  }

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : null;

  let gridState: ReactNode = null;
  if (isLoading && filteredParts.length === 0) {
    gridState = (
      <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index}>
            <Skeleton className="aspect-square w-full rounded-2xl" />
          </li>
        ))}
      </ul>
    );
  } else if (error && filteredParts.length === 0) {
    gridState = (
      <EmptyState icon={<SearchX size={32} />}>
        <span className="font-semibold">{t('list.failedToLoad')}</span>
        {errorMessage ? <span className="mt-1 block text-sm">{errorMessage}</span> : null}
        <span className="mt-1 block text-sm">{t('list.errorMessage')}</span>
      </EmptyState>
    );
  } else if (!isLoading && filteredParts.length === 0) {
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
        { label: t('index.breadcrumbs.parts') },
      ]}
      title={t('index.title')}
      count={
        showResultCount
          ? t('index.count', { count: filters.inStockOnly ? filteredParts.length : total })
          : null
      }
      sort={{
        label: t('indexPage.sortBy', { ns: 'common' }),
        value: toolbarSort,
        onChange: (value) => setFilter('parts', 'sort', value),
        options: (
          [
            { value: 'RELEVANCE', label: t('filter.relevance') },
            { value: 'PRICE_ASC', label: t('filter.priceLowToHigh') },
            { value: 'PRICE_DESC', label: t('filter.priceHighToLow') },
            { value: 'NEWEST', label: t('filter.newestFirst') },
          ] as const
        ).map((option) => ({ value: option.value, label: option.label })),
      }}
      filters={
        <PartsFilters
          inStockSupported={inStockSupported}
          options={{
            brands: [{ value: '', label: t('filter.allBrands') }, ...selectOptions.brands],
            locations: [{ value: '', label: t('filter.anyLocation') }, ...selectOptions.locations],
          }}
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
        show: t('index.show', { count: filters.inStockOnly ? filteredParts.length : total }),
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
          pageOf: (current, totalPages) =>
            t('indexPage.pagination.pageOf', { ns: 'common', page: current, pageCount: totalPages }),
          loadMore: t('buttons.loadMore', { ns: 'common' }),
        },
      }}
    >
      {visible.map((part) => (
        <li key={part.id}>
          <PartCard part={part} />
        </li>
      ))}
    </IndexPage>
  );
}
