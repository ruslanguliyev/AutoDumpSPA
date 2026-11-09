import { useTranslation } from 'react-i18next';

import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import type { FilterValue } from '@/features/filters/types/filters.types';
import { todayString } from '@/features/rentals/api/rentals.api';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
import { labelClass } from '@/shared/ui/field';

const VEHICLE_CLASS_OPTIONS = [
  'sedan',
  'hatchback',
  'liftback',
  'wagon',
  'suv',
  'crossover',
  'coupe',
  'convertible',
  'minivan',
  'van',
  'pickup',
  'sport',
  'other',
] as const;

const asNumberText = (value: FilterValue) => (value === null || value === undefined ? '' : String(value));
const toNumberOrNull = (text: string) => (text.trim() === '' ? null : Number(text));

/** Rent catalogue filters — date range first, then price/day, class, deposit cap, city. */
export default function RentFilters({ size = 'md' }: { size?: 'md' | 'drawer' }) {
  const { t } = useTranslation(['vehicle', 'dashboard']);
  const filters = useFilters('rent');
  const setFilter = useFiltersStore((state) => state.setFilter);

  const today = todayString();
  const from = String(filters.availableFrom ?? '');
  const to = String(filters.availableTo ?? '');
  const periodInvalid = Boolean(from && to && to < from);

  const classOptions = [
    { value: '', label: t('rentIndex.filters.anyClass') },
    ...VEHICLE_CLASS_OPTIONS.map((value) => ({
      value,
      label: t(`form.vehicleCategories.${value}`, { ns: 'addItem', defaultValue: value }),
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={`${labelClass} mb-1.5`}>{t('rentIndex.filters.availability')}</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input
            size={size}
            type="date"
            min={today}
            label={t('rental.from', { ns: 'dashboard' })}
            labelHidden
            value={from}
            onChange={(event) => setFilter('rent', 'availableFrom', event.target.value)}
          />
          <Input
            size={size}
            type="date"
            min={from || today}
            label={t('rental.to', { ns: 'dashboard' })}
            labelHidden
            value={to}
            onChange={(event) => setFilter('rent', 'availableTo', event.target.value)}
          />
        </div>
        {periodInvalid ? (
          <p role="alert" className="mt-1 text-[12px] text-destructive">
            {t('rental.errors.order', { ns: 'dashboard' })}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={`${labelClass} mb-1.5`}>{t('rentIndex.filters.pricePerDay')}</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input
            size={size}
            type="number"
            inputMode="numeric"
            min={0}
            label={t('index.filters.from')}
            labelHidden
            placeholder={t('index.filters.from')}
            value={asNumberText(filters.priceFrom)}
            onChange={(event) => setFilter('rent', 'priceFrom', toNumberOrNull(event.target.value))}
          />
          <Input
            size={size}
            type="number"
            inputMode="numeric"
            min={0}
            label={t('index.filters.to')}
            labelHidden
            placeholder={t('index.filters.to')}
            value={asNumberText(filters.priceTo)}
            onChange={(event) => setFilter('rent', 'priceTo', toNumberOrNull(event.target.value))}
          />
        </div>
      </fieldset>

      <Select
        size={size}
        label={t('rentIndex.filters.class')}
        options={classOptions}
        value={String(filters.vehicleClass ?? '')}
        onChange={(event) => setFilter('rent', 'vehicleClass', event.target.value)}
      />

      <Input
        size={size}
        type="number"
        inputMode="numeric"
        min={0}
        label={t('rentIndex.filters.depositUpTo')}
        placeholder={t('rentIndex.filters.depositUpTo')}
        value={asNumberText(filters.depositTo)}
        onChange={(event) => setFilter('rent', 'depositTo', toNumberOrNull(event.target.value))}
      />

      <Input
        size={size}
        label={t('index.filters.city')}
        placeholder={t('filter.cityPlaceholder')}
        value={String(filters.city ?? '')}
        onChange={(event) => setFilter('rent', 'city', event.target.value)}
      />
    </div>
  );
}
