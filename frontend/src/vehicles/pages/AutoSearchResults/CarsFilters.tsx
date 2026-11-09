import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import type { FilterValue } from '@/features/filters/types/filters.types';
import { getModelsForBrandFromSpecs } from '@/lib/carSpecsData';
import { makesByCategory, modelsByMake } from '@/vehicles/components/AutoSearchFilter/options';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Chip } from '@/shared/ui/Chip';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
import { labelClass } from '@/shared/ui/field';

const BRANDS = makesByCategory.car
  .filter((brand: string) => brand !== 'All Makes')
  .map((brand: string) => ({ value: brand, label: brand }));

const asList = (value: FilterValue): string[] => (Array.isArray(value) ? value.map(String) : []);
const asNumberText = (value: FilterValue) => (value === null || value === undefined ? '' : String(value));
const toNumberOrNull = (text: string) => (text.trim() === '' ? null : Number(text));

/**
 * The cars filters, written once and rendered in the sidebar and in the drawer. The
 * `size` follows where it sits: 48px controls in the drawer, 44px in the sidebar.
 */
export default function CarsFilters({ size = 'md' }: { size?: 'md' | 'drawer' }) {
  const { t } = useTranslation('vehicle');
  const filters = useFilters('cars');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const toggleFilterValue = useFiltersStore((state) => state.toggleFilterValue);

  const brand = String(filters.brand ?? '').trim();
  const modelOptions = useMemo(() => {
    if (!brand) return [];
    const merged = [
      ...new Set([...getModelsForBrandFromSpecs(brand), ...(modelsByMake[brand] ?? [])]),
    ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    return merged.map((model) => ({ value: model, label: model }));
  }, [brand]);

  const transmission = asList(filters.transmission);
  const fuel = asList(filters.fuel);

  const transmissions = [
    { value: 'Automatic', label: t('filter.transmissionAutomatic') },
    { value: 'Manual', label: t('filter.transmissionManual') },
  ];
  const fuels = [
    { value: 'Petrol', label: t('filter.fuelPetrol') },
    { value: 'Diesel', label: t('filter.fuelDiesel') },
    { value: 'Hybrid', label: t('filter.fuelHybrid') },
    { value: 'Electric', label: t('filter.fuelElectric') },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Select
        size={size}
        label={t('index.filters.brand')}
        placeholder={t('index.filters.anyBrand')}
        options={BRANDS}
        value={String(filters.brand ?? '')}
        // A model belongs to a brand, so changing the brand clears it.
        onChange={(event) => setFilters('cars', { brand: event.target.value, model: '' })}
      />
      <Select
        size={size}
        label={t('index.filters.model')}
        placeholder={brand ? t('filter.allModels') : t('filter.selectMakeFirst')}
        options={modelOptions}
        value={String(filters.model ?? '')}
        disabled={!brand}
        onChange={(event) => setFilter('cars', 'model', event.target.value)}
      />
      <Input
        size={size}
        label={t('index.filters.city')}
        placeholder={t('filter.cityPlaceholder')}
        value={String(filters.city ?? '')}
        onChange={(event) => setFilter('cars', 'city', event.target.value)}
      />

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={`${labelClass} mb-1.5`}>{t('index.filters.price')}</legend>
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
            onChange={(event) => setFilter('cars', 'priceFrom', toNumberOrNull(event.target.value))}
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
            onChange={(event) => setFilter('cars', 'priceTo', toNumberOrNull(event.target.value))}
          />
        </div>
      </fieldset>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={`${labelClass} mb-1.5`}>{t('index.filters.year')}</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input
            size={size}
            type="number"
            inputMode="numeric"
            min={1900}
            label={t('index.filters.from')}
            labelHidden
            placeholder={t('index.filters.from')}
            value={asNumberText(filters.yearFrom)}
            onChange={(event) => setFilter('cars', 'yearFrom', toNumberOrNull(event.target.value))}
          />
          <Input
            size={size}
            type="number"
            inputMode="numeric"
            min={1900}
            label={t('index.filters.to')}
            labelHidden
            placeholder={t('index.filters.to')}
            value={asNumberText(filters.yearTo)}
            onChange={(event) => setFilter('cars', 'yearTo', toNumberOrNull(event.target.value))}
          />
        </div>
      </fieldset>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={`${labelClass} mb-2`}>{t('index.filters.transmission')}</legend>
        <div className="flex flex-wrap gap-2">
          {transmissions.map((option) => (
            <Chip
              key={option.value}
              selected={transmission.includes(option.value)}
              onClick={() => toggleFilterValue('cars', 'transmission', option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={`${labelClass} mb-1`}>{t('index.filters.fuel')}</legend>
        {fuels.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={fuel.includes(option.value)}
            onChange={() => toggleFilterValue('cars', 'fuel', option.value)}
          />
        ))}
      </fieldset>
    </div>
  );
}
