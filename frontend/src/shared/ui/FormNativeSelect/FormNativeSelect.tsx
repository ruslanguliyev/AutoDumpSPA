import { cn } from '@/shared/utils/cn';

export type NativeSelectOption = { value: string; label: string };

const selectClass =
  'w-full min-h-[42px] rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export type FormNativeSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: NativeSelectOption[];
  placeholder: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  'aria-label'?: string;
};

export function FormNativeSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  error,
  className,
  'aria-label': ariaLabel,
}: FormNativeSelectProps) {
  return (
    <div className={className}>
      <select
        id={id}
        aria-label={ariaLabel}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        className={cn(selectClass, error && 'border-destructive')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
