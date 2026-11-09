import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import type { FilterValue } from '@/features/filters/types/filters.types';
import { PART_CATEGORIES } from '@/parts/utils/parts.constants';
import { Checkbox } from '@/shared/ui/Checkbox';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
import { labelClass } from '@/shared/ui/field';

const asNumberText = (value: FilterValue) =>
  value === null || value === undefined ? '' : String(value);

type PartsFilterOptions = {
  brands?: Array<{ value: string; label: string }>;
  locations?: Array<{ value: string; label: string }>;
};

type PartsFiltersProps = {
  size?: 'md' | 'drawer';
  options?: PartsFilterOptions;
  /** Off when the catalogue is paginated and in-stock would lie. */
  inStockSupported?: boolean;
};

/** Parts catalogue filters for the index sidebar and mobile drawer. */
export default function PartsFilters({
  size = 'md',
  options = {},
  inStockSupported = true,
}: PartsFiltersProps) {
  const { t } = useTranslation('part');
  const filters = useFilters('parts');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const setFilters = useFiltersStore((state) => state.setFilters);

  const categories = useMemo(
    () => [
      { value: '', label: t('filter.allCategories') },
      ...PART_CATEGORIES.map((category) => ({
        value: category.value,
        label: t(`categories.${category.value}`),
      })),
    ],
    [t]
  );

  const conditions = useMemo(
    () => [
      { value: '', label: t('filter.anyCondition') },
      { value: 'new', label: t('filter.new') },
      { value: 'used', label: t('filter.used') },
      { value: 'refurbished', label: t('filter.refurbished') },
    ],
    [t]
  );

  const toNumberOrEmpty = (text: string) => (text.trim() === '' ? '' : text);

  return (
    <div className="flex flex-col gap-4">
      <Input
        size={size}
        type="search"
        label={t('filter.search')}
        placeholder={t('filter.search')}
        value={String(filters.search ?? '')}
        onChange={(event) => setFilter('parts', 'search', event.target.value)}
      />

      <Select
        size={size}
        label={t('filter.category')}
        options={categories}
        value={String(filters.category ?? '')}
        onChange={(event) => setFilter('parts', 'category', event.target.value)}
      />

      <Select
        size={size}
        label={t('filter.brand')}
        placeholder={t('filter.allBrands')}
        options={options.brands ?? []}
        value={String(filters.brand ?? '')}
        onChange={(event) => setFilters('parts', { brand: event.target.value, model: '' })}
      />

      <Select
        size={size}
        label={t('filter.condition')}
        options={conditions}
        value={String(filters.condition ?? '')}
        onChange={(event) => setFilter('parts', 'condition', event.target.value)}
      />

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={`${labelClass} mb-1.5`}>{t('index.filters.price')}</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input
            size={size}
            type="number"
            inputMode="numeric"
            min={0}
            label={t('filter.from')}
            labelHidden
            placeholder={t('filter.from')}
            value={asNumberText(filters.priceFrom)}
            onChange={(event) => setFilter('parts', 'priceFrom', toNumberOrEmpty(event.target.value))}
          />
          <Input
            size={size}
            type="number"
            inputMode="numeric"
            min={0}
            label={t('filter.to')}
            labelHidden
            placeholder={t('filter.to')}
            value={asNumberText(filters.priceTo)}
            onChange={(event) => setFilter('parts', 'priceTo', toNumberOrEmpty(event.target.value))}
          />
        </div>
      </fieldset>

      <Select
        size={size}
        label={t('index.filters.city')}
        placeholder={t('filter.anyLocation')}
        options={options.locations ?? []}
        value={String(filters.location ?? '')}
        onChange={(event) => setFilter('parts', 'location', event.target.value)}
      />

      {inStockSupported ? (
        <Checkbox
          label={t('index.filters.inStockOnly')}
          checked={Boolean(filters.inStockOnly)}
          onChange={(event) => setFilter('parts', 'inStockOnly', event.target.checked)}
        />
      ) : null}
    </div>
  );
}
