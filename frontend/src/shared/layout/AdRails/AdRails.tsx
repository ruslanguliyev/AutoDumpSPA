import type { ReactNode } from 'react';

type AdRailsProps = {
  /** Rail content. Left empty, the column is reserved but nothing is drawn. */
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
};

/**
 * The ad-rail shell from design/pages.md: a 160px rail either side of a 1200px content
 * column. Below the breakpoint the rails are gone and the page lays out exactly as it
 * would without this wrapper — the breakpoint changes nothing else.
 *
 * The breakpoint is 1584px, not the 1440px the first draft of the spec named: two 160px
 * rails, two 16px gaps and two 16px gutters need 1584px before the content column can be
 * 1200px. At 1440px something has to give, and narrowing the content on the commonest
 * desktop width to make room for adverts is the wrong thing to give.
 *
 * Paid placement is always labelled, so a rail's content is expected to carry its own
 * "Ad" pill; `AdSlot` below is the placeholder the design draws.
 */
export function AdRails({ left, right, children }: AdRailsProps) {
  return (
    <div className="w-full min-[1584px]:mx-auto min-[1584px]:flex min-[1584px]:max-w-[1584px] min-[1584px]:justify-center min-[1584px]:gap-4 min-[1584px]:px-4">
      <aside
        className="hidden w-40 shrink-0 min-[1584px]:block"
        aria-label="Advertisement"
        aria-hidden={left ? undefined : true}
      >
        {left ? <div className="sticky top-24">{left}</div> : null}
      </aside>

      <div className="min-w-0 min-[1584px]:w-[1200px] min-[1584px]:max-w-[1200px]">{children}</div>

      <aside
        className="hidden w-40 shrink-0 min-[1584px]:block"
        aria-label="Advertisement"
        aria-hidden={right ? undefined : true}
      >
        {right ? <div className="sticky top-24">{right}</div> : null}
      </aside>
    </div>
  );
}

/** The dashed placeholder the design shows in a rail, with its "Ad" label. */
export function AdSlot({ width = 160, height = 600 }: { width?: number; height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border-strong bg-card-muted/40 text-center dark:border-border"
      style={{ width, height }}
    >
      <span className="inline-flex items-center rounded-full border border-muted-foreground px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[0.04em] text-foreground">
        Ad
      </span>
      <span className="text-[11px] text-muted-foreground">
        {width} × {height}
      </span>
    </div>
  );
}

export default AdRails;
