import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import { Specialization } from '@/specialists/types/specialist.types';
import { Checkbox } from '@/shared/ui/Checkbox';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';
type SpecialistsFiltersProps = {
  size?: 'md' | 'drawer';
  vehiclesFilterSupported?: boolean;
};

export default function SpecialistsFilters({
  size = 'md',
  vehiclesFilterSupported = false,
}: SpecialistsFiltersProps) {
  const { t } = useTranslation('specialists');
  const filters = useFilters('specialists');
  const setFilter = useFiltersStore((state) => state.setFilter);

  const specializationOptions = useMemo(
    () => [
      { value: '', label: t('filters.specializationAny') },
      ...Object.values(Specialization).map((value) => ({
        value,
        label: t(`specializations.${value}`),
      })),
    ],
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
        onChange={(event) => setFilter('specialists', 'city', event.target.value)}
      />

      <Select
        size={size}
        label={t('filters.specialization')}
        options={specializationOptions}
        value={String(filters.specialization ?? '')}
        onChange={(event) => setFilter('specialists', 'specialization', event.target.value)}
      />

      {vehiclesFilterSupported ? (
        <Input
          size={size}
          label={t('index.filters.vehiclesServiced')}
          placeholder={t('filters.brandPlaceholder')}
          value={String(filters.brand ?? '')}
          onChange={(event) => setFilter('specialists', 'brand', event.target.value)}
        />
      ) : null}

      <Select
        size={size}
        label={t('filters.minRating')}
        options={ratingOptions}
        value={String(filters.minRating ?? '')}
        onChange={(event) => setFilter('specialists', 'minRating', event.target.value)}
      />

      <Checkbox
        label={t('index.filters.availableNow')}
        checked={Boolean(filters.availableNow)}
        onChange={(event) => setFilter('specialists', 'availableNow', event.target.checked)}
      />
    </div>
  );
}
