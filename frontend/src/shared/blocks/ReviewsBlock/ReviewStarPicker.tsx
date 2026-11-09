import { Star } from 'lucide-react';

type Props = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
};

/** Five 44px targets with 36px stars — design/detail reviews form. */
export function ReviewStarPicker({ value, onChange, label, disabled = false }: Props) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n}`}
            disabled={disabled}
            onClick={() => onChange(n)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius)] transition hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <Star
              size={36}
              strokeWidth={1.5}
              aria-hidden="true"
              className={filled ? 'fill-star text-star' : 'text-subtle-foreground'}
            />
          </button>
        );
      })}
    </div>
  );
}

export default ReviewStarPicker;
