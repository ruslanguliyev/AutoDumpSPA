import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFilters, useFiltersStore } from '@/features/filters/store/useFiltersStore';
import { Checkbox } from '@/shared/ui/Checkbox';
import Input from '@/shared/ui/Input/Input';
import Select from '@/shared/ui/Select/Select';

type CityOption = { value: string; label: string };

type SellersFiltersProps = {
  size?: 'md' | 'drawer';
  cities?: CityOption[];
};

export default function SellersFilters({ size = 'md', cities = [] }: SellersFiltersProps) {
  const { t } = useTranslation('sellers');
  const filters = useFilters('sellers');
  const setFilter = useFiltersStore((state) => state.setFilter);

  const typeOptions = useMemo(
    () => [
      { value: '', label: t('filters.sellerTypeOptions.any') },
      { value: 'dealer', label: t('filters.sellerTypeOptions.dealer') },
      { value: 'parts', label: t('filters.sellerTypeOptions.parts') },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-4">
      <Input
        size={size}
        type="search"
        label={t('index.filters.search')}
        placeholder={t('filters.searchPlaceholder')}
        value={String(filters.search ?? '')}
        onChange={(event) => setFilter('sellers', 'search', event.target.value)}
      />

      <Select
        size={size}
        label={t('filters.sellerType')}
        options={typeOptions}
        value={String(filters.sellerType ?? '')}
        onChange={(event) => setFilter('sellers', 'sellerType', event.target.value)}
      />

      <Select
        size={size}
        label={t('index.filters.city')}
        placeholder={t('filters.cityOptions.any')}
        options={cities}
        value={String(filters.city ?? '')}
        onChange={(event) => setFilter('sellers', 'city', event.target.value)}
      />

      <Checkbox
        label={t('filters.verifiedOnly')}
        checked={Boolean(filters.verifiedOnly)}
        onChange={(event) => setFilter('sellers', 'verifiedOnly', event.target.checked)}
      />
    </div>
  );
}
