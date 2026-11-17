import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { controlClass } from '@/shared/ui/controlClass';
import { FieldError, FieldHint, FieldLabel } from '@/shared/ui/field';
import type { FieldSize } from '@/shared/ui/field';

type InputProps = {
  /** Always required. Pass `labelHidden` where a toolbar already names the field. */
  label: ReactNode;
  labelHidden?: boolean;
  error?: ReactNode;
  hint?: ReactNode;
  size?: FieldSize;
  className?: string;
  /** Classes for the wrapper, when the field has to stretch or sit in a grid. */
  wrapperClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'>;

export function Input({
  label,
  labelHidden = false,
  error,
  hint,
  size = 'md',
  className = '',
  wrapperClassName = '',
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className={wrapperClassName}>
      <FieldLabel htmlFor={inputId} hidden={labelHidden}>
        {label}
      </FieldLabel>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined}
        className={`${controlClass(size, Boolean(error))} ${className}`.trim()}
        {...props}
      />
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

export default Input;
