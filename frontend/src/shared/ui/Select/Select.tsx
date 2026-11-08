import { useId } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';

import { FieldError, FieldHint, FieldLabel, controlClass } from '@/shared/ui/field';
import type { FieldSize } from '@/shared/ui/field';

export type SelectOption = { value: string; label: string; disabled?: boolean };

type SelectProps = {
  label: ReactNode;
  labelHidden?: boolean;
  /** The empty first entry, e.g. "Any brand". Left out when the field is required. */
  placeholder?: string;
  options?: SelectOption[];
  error?: ReactNode;
  hint?: ReactNode;
  size?: FieldSize;
  className?: string;
  wrapperClassName?: string;
  children?: ReactNode;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'className' | 'children'>;

export function Select({
  label,
  labelHidden = false,
  placeholder,
  options,
  error,
  hint,
  size = 'md',
  className = '',
  wrapperClassName = '',
  id,
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  return (
    <div className={wrapperClassName}>
      <FieldLabel htmlFor={selectId} hidden={labelHidden}>
        {label}
      </FieldLabel>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined}
        // The native arrow stays: it is the control people already know, and it
        // follows the platform in both themes without a second element to style.
        className={`${controlClass(size, Boolean(error))} ${className}`.trim()}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

export default Select;
