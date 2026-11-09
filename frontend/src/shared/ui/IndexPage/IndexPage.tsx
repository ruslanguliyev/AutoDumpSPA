import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import type { BreadcrumbItem } from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import Button from '@/shared/ui/button';
import { Chip } from '@/shared/ui/Chip';
import Pagination from '@/shared/ui/Pagination/Pagination';
import type { PaginationLabels } from '@/shared/ui/Pagination/Pagination';
import Select from '@/shared/ui/Select/Select';
import type { SelectOption } from '@/shared/ui/Select/Select';
import FilterDrawer from './FilterDrawer';
import type { FilterDrawerLabels } from './FilterDrawer';

export type ActiveFilterChip = { key: string; label: string; onRemove: () => void };

type IndexPageProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  /** "1 248 listings in Baku". Shown beside the H1, never inside it, so the title stays a title. */
  count: ReactNode;
  sort: {
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
  };
  /** The filter controls. Rendered in the sidebar from 1024px and in the drawer below. */
  filters: ReactNode;
  filtersLabel: string;
  activeFilterCount: number;
  onResetFilters: () => void;
  drawerLabels: FilterDrawerLabels;
  /** Chips for filters that are on, shown under the toolbar on small screens. */
  activeChips?: ActiveFilterChip[];
  removeChipLabel?: string;
  /** Anything above the results, e.g. the labelled promoted strip. */
  above?: ReactNode;
  /** The cards. Rendered inside the 3-column grid. */
  children: ReactNode;
  /** Replaces the grid when there is nothing to show (loading skeletons or the empty state). */
  gridState?: ReactNode;
  pagination: {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    labels: PaginationLabels;
  };
};

/**
 * The skeleton of every index page: breadcrumbs, H1 with its result count and sort,
 * a filter sidebar that becomes a bottom sheet under 1024px, a card grid and pagination.
 * Pages pass their own filters and cards; the layout is decided here once.
 */
export function IndexPage({
  breadcrumbs,
  title,
  count,
  sort,
  filters,
  filtersLabel,
  activeFilterCount,
  onResetFilters,
  drawerLabels,
  activeChips = [],
  removeChipLabel,
  above,
  children,
  gridState,
  pagination,
}: IndexPageProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const sortField = (
    <Select
      label={sort.label}
      labelHidden
      value={sort.value}
      onChange={(event) => sort.onChange(event.target.value)}
      options={sort.options}
      wrapperClassName="min-w-0 flex-1 sm:w-56 sm:flex-none"
    />
  );

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground [overflow-wrap:anywhere] md:text-[30px]">
            {title}
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">{count}</p>
        </div>

        <div className="flex w-full items-center gap-3 md:w-auto">
          <Button
            variant="ghost"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            className="lg:hidden"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            {filtersLabel}
            {activeFilterCount > 0 ? (
              <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[12px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
          {sortField}
        </div>
      </div>

      {activeChips.length > 0 ? (
        <ul className="-mt-3 mb-6 flex list-none flex-wrap gap-2 lg:hidden">
          {activeChips.map((chip) => (
            <li key={chip.key}>
              <Chip onRemove={chip.onRemove} removeLabel={removeChipLabel}>
                {chip.label}
              </Chip>
            </li>
          ))}
        </ul>
      ) : null}

      {above}

      <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside
          aria-label={filtersLabel}
          className="sticky top-24 hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] lg:block"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-semibold text-foreground">{filtersLabel}</h2>
            <Button variant="secondary" size="sm" onClick={onResetFilters} className="border-transparent">
              {drawerLabels.reset}
            </Button>
          </div>
          {filters}
        </aside>

        <div className="min-w-0">
          {gridState ?? (
            <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</ul>
          )}
          <Pagination
            className="mt-8"
            page={pagination.page}
            pageCount={pagination.pageCount}
            onPageChange={pagination.onPageChange}
            labels={pagination.labels}
          />
        </div>
      </div>

      <FilterDrawer open={drawerOpen} onClose={closeDrawer} onReset={onResetFilters} labels={drawerLabels}>
        {filters}
      </FilterDrawer>
    </div>
  );
}

export default IndexPage;
