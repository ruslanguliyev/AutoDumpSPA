import type { ReactNode } from 'react';

/**
 * The parts every form control shares: the visible label, the box, the error line.
 *
 * design/components.md asks for a real label above each field rather than a placeholder
 * standing in for one, because a placeholder disappears exactly when the user needs it.
 */
export type FieldSize = 'md' | 'drawer';

/** 12px uppercase label, the "Label" row of the typography table. */
export const labelClass =
  'block text-[12px] font-semibold uppercase leading-none tracking-[0.06em] text-muted-foreground';

/** 44px by default; 48px for the mobile filter drawer. */
const sizeClass: Record<FieldSize, string> = {
  md: 'h-11 px-3',
  drawer: 'h-12 px-3.5',
};

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

export const FieldLabel = ({
  htmlFor,
  hidden = false,
  children,
}: {
  htmlFor: string;
  hidden?: boolean;
  children: ReactNode;
}) => (
  <label htmlFor={htmlFor} className={hidden ? 'sr-only' : `${labelClass} mb-1.5`}>
    {children}
  </label>
);

export const FieldError = ({ id, children }: { id: string; children: ReactNode }) => (
  <p id={id} role="alert" className="mt-1 text-[13px] text-destructive">
    {children}
  </p>
);

export const FieldHint = ({ id, children }: { id: string; children: ReactNode }) => (
  <p id={id} className="mt-1 text-[13px] text-muted-foreground">
    {children}
  </p>
);
