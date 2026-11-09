import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

import Button from '@/shared/ui/button';

export type FilterDrawerLabels = {
  title: string;
  reset: string;
  close: string;
  clearAll: string;
  /** The sticky footer's primary action, e.g. "Show 1 248 cars". */
  show: string;
};

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  labels: FilterDrawerLabels;
  children: ReactNode;
};

/**
 * The filter sidebar below 1024px: a bottom sheet with a grabber, a scrollable body and a
 * sticky footer. It only exists under `lg`, so the sidebar and the sheet never compete.
 */
export function FilterDrawer({ open, onClose, onReset, labels, children }: FilterDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-scrim backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-2xl border border-b-0 border-border bg-card shadow-[var(--shadow-card)] focus-visible:outline-none"
      >
        <div className="flex justify-center pb-1 pt-2.5" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-border-strong" />
        </div>

        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-1">
          <h2 className="text-[20px] font-semibold tracking-tight text-foreground">{labels.title}</h2>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onReset} className="border-transparent">
              {labels.reset}
            </Button>
            <Button variant="icon" onClick={onClose} aria-label={labels.close}>
              <X size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>

        <div className="flex gap-3 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button variant="ghost" size="drawer" onClick={onReset}>
            {labels.clearAll}
          </Button>
          <Button variant="primary" size="drawer" onClick={onClose} className="flex-1">
            {labels.show}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FilterDrawer;
