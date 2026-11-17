import type { ReactNode } from 'react';

/**
 * The parts every form control shares: the visible label and the error or hint line.
 * The box itself is `controlClass`, kept in its own file so this module only exports components.
 *
 * design/components.md asks for a real label above each field rather than a placeholder
 * standing in for one, because a placeholder disappears exactly when the user needs it.
 */
export type FieldSize = 'md' | 'drawer';

/** 12px uppercase label, the "Label" row of the typography table. */
export const labelClass =
  'block text-[12px] font-semibold uppercase leading-none tracking-[0.06em] text-muted-foreground';

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
