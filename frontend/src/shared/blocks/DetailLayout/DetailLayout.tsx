import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type DetailLayoutMobileBarProps = {
  /** Icon-only control (favourite, share, …). Must be 44×44. */
  iconAction: ReactNode;
  /** Optional middle control (e.g. “Message”). Must be 44px high. */
  secondaryAction?: ReactNode;
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
 * Below `lg` the sidebar stacks under main; the optional sticky bottom bar carries the primary actions.
 *
 * The bar is 44px of control plus 8px above and below, and grows by the device's bottom
 * safe-area inset. While it is mounted `body.has-mobile-bar` reserves the same height under the
 * footer (see `index.css`), so the bar never covers the last of the content or the footer.
 */
export function DetailLayout({ main, sidebar, mobileBar, className = '' }: DetailLayoutProps) {
  const { t } = useTranslation('common');
  const hasBar = Boolean(mobileBar);

  useEffect(() => {
    if (!hasBar) return undefined;
    document.body.classList.add('has-mobile-bar');
    return () => document.body.classList.remove('has-mobile-bar');
  }, [hasBar]);

  return (
    <div className={className}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">{main}</div>
        <aside className="flex w-full flex-col gap-8 lg:sticky lg:top-24 lg:w-[360px] lg:shrink-0">
          {sidebar}
        </aside>
      </div>

      {mobileBar ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:hidden"
          role="region"
          aria-label={t('detailBar.aria')}
        >
          <div className="mx-auto flex max-w-[1280px] items-center gap-2">
            <div className="shrink-0">{mobileBar.iconAction}</div>
            {mobileBar.secondaryAction ? (
              <div className="min-w-0 shrink-0">{mobileBar.secondaryAction}</div>
            ) : null}
            <div className="min-w-0 flex-1">{mobileBar.primaryAction}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DetailLayout;
