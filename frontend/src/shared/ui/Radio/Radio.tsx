import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { FieldError, labelClass } from '@/shared/ui/field';

type RadioProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>;

const controlClass =
  'h-5 w-5 shrink-0 border border-border-strong bg-background [accent-color:rgb(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 dark:border-border';

const rowClass =
  'flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-foreground has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50';

export function Radio({ label, hint, error, className = '', id, ...props }: RadioProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={className}>
      <label htmlFor={inputId} className={rowClass}>
        <input
          id={inputId}
          type="radio"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${controlClass} rounded-full`}
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

/**
 * A labelled set of radios. Radios without a group have no accessible name for the
 * question they answer, so the fieldset is part of the component rather than optional.
 */
export function RadioGroup({
  label,
  children,
  className = '',
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={className}>
      <legend className={`${labelClass} mb-1.5`}>{label}</legend>
      {children}
    </fieldset>
  );
}

export default Radio;
