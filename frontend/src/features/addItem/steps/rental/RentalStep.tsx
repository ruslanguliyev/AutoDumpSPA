import { useTranslation } from 'react-i18next';

import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import type { ListingRental } from '@/features/addItem/store/useAddItemStore';
import { emptyRental } from '@/features/addItem/store/useAddItemStore';
import {
  parseOptionalAmount,
  parseOptionalInt,
} from '@/features/addItem/utils/validateDraft';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const labelClass =
  'mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground';

/** Rental conditions of a car offered for rent: period limits, deposit, mileage and driver age. */
const RentalStep = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setRentalField = useAddItemStore((state) => state.setRentalField);

  if (!draft) return null;
  const rental = draft.rental ?? emptyRental();

  const minDays = parseOptionalInt(rental.minDays, 1, 365);
  const maxDays = parseOptionalInt(rental.maxDays, 1, 365);
  const errors: Partial<Record<keyof ListingRental, string>> = {
    minDays: !minDays ? t('rental.errors.minDays') : undefined,
    maxDays:
      maxDays === undefined || (maxDays !== null && minDays && maxDays < minDays)
        ? t('rental.errors.maxDays')
        : undefined,
    deposit: parseOptionalAmount(rental.deposit) === undefined ? t('rental.errors.deposit') : undefined,
    kmPerDay: parseOptionalInt(rental.kmPerDay, 1, 5000) === undefined ? t('rental.errors.kmPerDay') : undefined,
    minDriverAge:
      parseOptionalInt(rental.minDriverAge, 16, 100) === undefined ? t('rental.errors.minDriverAge') : undefined,
  };

  const field = (key: keyof ListingRental, label: string, hint: string, placeholder: string) => (
    <div>
      <label className={labelClass} htmlFor={`rental-${key}`}>
        {label}
      </label>
      <input
        id={`rental-${key}`}
        className={inputClass}
        type="number"
        min={0}
        step={key === 'deposit' ? 'any' : 1}
        inputMode="decimal"
        placeholder={placeholder}
        value={rental[key]}
        onChange={(event) => setRentalField(key, event.target.value)}
      />
      {errors[key] ? (
        <p className="mt-1 text-xs text-destructive">{errors[key]}</p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('rental.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('rental.hint')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {field('minDays', t('rental.minDays'), t('rental.minDaysHint'), '1')}
        {field('maxDays', t('rental.maxDays'), t('rental.maxDaysHint'), '30')}
        {field('deposit', t('rental.deposit', { currency: draft.common.pricing.currency }), t('rental.depositHint'), '0')}
        {field('kmPerDay', t('rental.kmPerDay'), t('rental.kmPerDayHint'), '300')}
        {field('minDriverAge', t('rental.minDriverAge'), t('rental.minDriverAgeHint'), '21')}
      </div>
    </div>
  );
};

export default RentalStep;
