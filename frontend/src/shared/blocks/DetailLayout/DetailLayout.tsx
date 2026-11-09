import type { ReactNode } from 'react';

export type DetailLayoutMobileBarProps = {
  /** Icon-only control (favourite, share, …). Must be 44×44. */
  iconAction: ReactNode;
  /** Full-width primary action for the sticky bar. */
  primaryAction: ReactNode;
};

type DetailLayoutProps = {
  main: ReactNode;
  sidebar: ReactNode;
  mobileBar?: DetailLayoutMobileBarProps;
  className?: string;
};

/**
 * Fluid main column + 360px sticky sidebar (`top-24`, 32px gap).
 * Below `lg` the sidebar stacks under main; optional sticky bottom bar carries the primary action.
 */
export function DetailLayout({ main, sidebar, mobileBar, className = '' }: DetailLayoutProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">{main}</div>
        <aside className="flex w-full flex-col gap-8 lg:sticky lg:top-24 lg:w-[360px] lg:shrink-0">
          {sidebar}
        </aside>
      </div>

      {mobileBar ? (
        <>
          <div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card px-4 py-3 lg:hidden"
            role="region"
            aria-label="Primary actions"
          >
            <div className="mx-auto flex max-w-[1280px] items-center gap-2">
              <div className="shrink-0">{mobileBar.iconAction}</div>
              <div className="min-w-0 flex-1">{mobileBar.primaryAction}</div>
            </div>
          </div>
          <div className="h-[72px] shrink-0 lg:hidden" aria-hidden="true" />
        </>
      ) : null}
    </div>
  );
}

export default DetailLayout;
