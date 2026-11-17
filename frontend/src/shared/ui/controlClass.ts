import type { FieldSize } from '@/shared/ui/field';

const sizeClass: Record<FieldSize, string> = {
  md: 'h-11 px-3',
  drawer: 'h-12 px-3.5',
};

/** Shared box for text inputs, selects and textareas. */
export const controlClass = (size: FieldSize = 'md', invalid = false) =>
  [
    'w-full rounded-[var(--radius)] border bg-background text-[15px] text-foreground',
    'placeholder:text-subtle-foreground',
    invalid ? 'border-destructive' : 'border-border-strong dark:border-border',
    'transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    sizeClass[size],
  ].join(' ');
