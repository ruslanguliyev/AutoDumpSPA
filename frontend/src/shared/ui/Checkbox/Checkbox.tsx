import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { FieldError } from '@/shared/ui/field';

type ChoiceProps = {
  label: ReactNode;
  /** Secondary line under the label, e.g. a result count. */
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>;

/**
 * The box itself is 20px, as the design asks, but the clickable row is 44px tall so the
 * target is not smaller than a fingertip. `accent-color` keeps the native control, which
 * already behaves correctly for keyboard, screen readers and high-contrast modes.
 */
const controlClass =
  'h-5 w-5 shrink-0 rounded-[4px] border border-border-strong bg-background [accent-color:rgb(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 dark:border-border';

const rowClass =
  'flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-foreground has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50';

export function Checkbox({ label, hint, error, className = '', id, ...props }: ChoiceProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={className}>
      <label htmlFor={inputId} className={rowClass}>
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={controlClass}
          {...props}
        />
        <span>
          {label}
          {hint ? <span className="block text-[13px] text-muted-foreground">{hint}</span> : null}
        </span>
      </label>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

export default Checkbox;
