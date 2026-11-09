import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import type { FilterValue } from '@/features/filters/types/filters.types';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Chip } from '@/shared/ui/Chip';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
import { labelClass } from '@/shared/ui/field';

const asList = (value: FilterValue): string[] => (Array.isArray(value) ? value.map(String) : []);

type BrandOption = { value: string; label: string };

type ServicesFiltersProps = {
  size?: 'md' | 'drawer';
  brands?: BrandOption[];
};

export default function ServicesFilters({ size = 'md', brands = [] }: ServicesFiltersProps) {
  const { t } = useTranslation('services');
  const filters = useFilters('services');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const toggleFilterValue = useFiltersStore((state) => state.toggleFilterValue);

  const serviceTypes = asList(filters.serviceTypes);

  const typeOptions = useMemo(
    () =>
      (['garage', 'official', 'detailing', 'tire', 'electric', 'body'] as const).map((value) => ({
        value,
        label: t(`filters.serviceTypes.${value}`),
      })),
    [t]
  );

  const ratingOptions = useMemo(
    () => [
      { value: '', label: t('filters.ratingOptions.any') },
      { value: '3', label: t('filters.ratingOptions.rating30') },
      { value: '3.5', label: t('filters.ratingOptions.rating35') },
      { value: '4', label: t('filters.ratingOptions.rating40') },
      { value: '4.5', label: t('filters.ratingOptions.rating45') },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-4">
      <Input
        size={size}
        label={t('index.filters.city')}
        placeholder={t('filters.cityPlaceholder')}
        value={String(filters.city ?? '')}
        onChange={(event) => setFilter('services', 'city', event.target.value)}
      />

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className={`${labelClass} mb-2`}>{t('index.filters.serviceType')}</legend>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <Chip
              key={option.value}
              selected={serviceTypes.includes(option.value)}
              onClick={() => toggleFilterValue('services', 'serviceTypes', option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      {brands.length > 0 ? (
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className={`${labelClass} mb-2`}>{t('index.filters.brandsServiced')}</legend>
          <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
            {brands.map((brand) => (
              <Chip
                key={brand.value}
                selected={asList(filters.brands).includes(brand.value)}
                onClick={() => toggleFilterValue('services', 'brands', brand.value)}
              >
                {brand.label}
              </Chip>
            ))}
          </div>
        </fieldset>
      ) : null}

      <Select
        size={size}
        label={t('index.filters.rating')}
        options={ratingOptions}
        value={String(filters.ratingFrom ?? '')}
        onChange={(event) => setFilter('services', 'ratingFrom', event.target.value)}
      />

      <Checkbox
        label={t('index.filters.verifiedOnly')}
        checked={Boolean(filters.verifiedOnly)}
        onChange={(event) => setFilter('services', 'verifiedOnly', event.target.checked)}
      />
    </div>
  );
}
