import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PaginationLabels = {
  /** Accessible name for the previous-page control. */
  prev: string;
  /** Accessible name for the next-page control. */
  next: string;
  /** Accessible name for a numbered page, e.g. (3) => "Page 3". */
  page: (page: number) => string;
  /** The mobile line, e.g. (1, 42) => "Page 1 of 42". */
  pageOf: (page: number, pageCount: number) => string;
  /** Label for the mobile "Load more" button. Only needed with `onLoadMore`. */
  loadMore?: string;
};

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Mobile replaces numbered pages with this, when the list can append. */
  onLoadMore?: () => void;
  hasMore?: boolean;
  labels: PaginationLabels;
  className?: string;
};

const cell =
  'inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--radius)] px-3 text-[15px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';
const idle = 'border border-border-strong bg-transparent text-foreground hover:bg-foreground/5 dark:border-border';
const current = 'border border-transparent bg-primary text-primary-foreground';

/** 1 … 4 5 6 … 42 — never more than seven cells, so the row never wraps on a phone. */
const pagesAround = (page: number, pageCount: number): (number | 'gap')[] => {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const out: (number | 'gap')[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(pageCount - 1, page + 1);
  if (from > 2) out.push('gap');
  for (let p = from; p <= to; p += 1) out.push(p);
  if (to < pageCount - 1) out.push('gap');
  out.push(pageCount);
  return out;
};

export function Pagination({
  page,
  pageCount,
  onPageChange,
  onLoadMore,
  hasMore = false,
  labels,
  className = '',
}: PaginationProps) {
  if (pageCount <= 1 && !onLoadMore) return null;

  return (
    <nav className={className} aria-label={labels.pageOf(page, pageCount)}>
      {/* Phone: one action plus where you are. */}
      <div className="flex flex-col items-center gap-3 sm:hidden">
        {onLoadMore && hasMore && labels.loadMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            className={`${cell} ${idle} w-full`}
          >
            {labels.loadMore}
          </button>
        ) : null}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label={labels.prev}
            className={`${cell} ${idle} w-11 px-0`}
          >
            <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <span className="text-[13px] text-muted-foreground">{labels.pageOf(page, pageCount)}</span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label={labels.next}
            className={`${cell} ${idle} w-11 px-0`}
          >
            <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Desktop: numbered pages. */}
      <ul className="hidden items-center justify-center gap-2 sm:flex">
        <li>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label={labels.prev}
            className={`${cell} ${idle} w-11 px-0`}
          >
            <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </li>
        {pagesAround(page, pageCount).map((entry, index) =>
          entry === 'gap' ? (
            <li
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1 text-[15px] text-subtle-foreground"
            >
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                onClick={() => onPageChange(entry)}
                aria-label={labels.page(entry)}
                aria-current={entry === page ? 'page' : undefined}
                className={`${cell} ${entry === page ? current : idle}`}
              >
                {entry}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label={labels.next}
            className={`${cell} ${idle} w-11 px-0`}
          >
            <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
