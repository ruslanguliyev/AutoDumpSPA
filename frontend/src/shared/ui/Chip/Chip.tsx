import { Slot } from '@radix-ui/react-slot';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type ChipProps = {
  children: ReactNode;
  /** Choice chip: a filled pill when selected, outlined when not. */
  selected?: boolean;
  onClick?: () => void;
  /**
   * Removable filter chip. The whole chip removes it, so the target is the full 44px
   * rather than a tiny ✕ nested inside another control.
   */
  onRemove?: () => void;
  /** Accessible name for the removing action, e.g. "Remove filter". Translated by the caller. */
  removeLabel?: string;
  /** `ai` is a parsed-search chip. `dashed` is a criterion the catalog could not apply. */
  tone?: 'default' | 'ai' | 'dashed';
  className?: string;
};

const base =
  'inline-flex items-center gap-2 rounded-full border px-4 text-[14px] font-semibold leading-none transition';
const interactive =
  'min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const unselected = 'border-border-strong bg-transparent text-muted-foreground hover:bg-foreground/5 dark:border-border';
const selectedClass = 'border-transparent bg-primary text-primary-foreground';
/** Static chips only label something (a specialisation, a serviced brand). */
const staticClass = 'min-h-8 border-border py-1.5 text-[13px] font-medium text-muted-foreground';
const aiClass = 'min-h-10 border-ai-border bg-ai-surface text-[13px] font-medium text-foreground';
const dashedClass =
  'min-h-10 border-dashed border-subtle-foreground bg-transparent text-[13px] font-normal text-foreground';

export function Chip({
  children,
  selected = false,
  onClick,
  onRemove,
  removeLabel,
  tone = 'default',
  className = '',
}: ChipProps) {
  const toneClass = tone === 'ai' ? aiClass : tone === 'dashed' ? dashedClass : '';
  if (onRemove) {
    return (
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel ? `${removeLabel}: ${String(children)}` : undefined}
        className={`${base} ${interactive} ${tone === 'default' ? unselected : toneClass} ${className}`.trim()}
      >
        {children}
        <X size={14} strokeWidth={1.5} aria-hidden="true" />
      </button>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`${base} ${interactive} ${tone === 'default' ? (selected ? selectedClass : unselected) : toneClass} ${className}`.trim()}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={`${base} ${tone === 'default' ? staticClass : toneClass} ${className}`.trim()}>
      {children}
    </span>
  );
}

export default Chip;
