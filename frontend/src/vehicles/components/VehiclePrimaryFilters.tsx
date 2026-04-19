import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFiltersStore, useFilters } from '@/features/filters/store/useFiltersStore';
import { getDefaultFilters } from '@/features/filters/store/filters.defaults';
import SelectFilter from '@/features/filters/components/controls/SelectFilter';
import TextFilter from '@/features/filters/components/controls/TextFilter';
import Button from '@/shared/ui/button';
import {
  makesByCategory,
  modelsByMake,
  priceRanges,
  registrationYears,
} from '@/vehicles/components/AutoSearchFilter/options';

type VehiclePrimaryFiltersProps = {
  resultsCount: number;
  onCtaClick?: () => void;
};

const VehiclePrimaryFilters = ({
  resultsCount,
  onCtaClick,
}: VehiclePrimaryFiltersProps) => {
  const { t } = useTranslation('vehicle');
  const filters = useFilters('cars');
  const setFilter = useFiltersStore((state) => state.setFilter);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const defaults = useMemo(() => getDefaultFilters('cars'), []);

  const makeOptions = useMemo(() => {
    const vehicleType = String(filters.vehicleType || 'car');
    const makes = makesByCategory[vehicleType] ?? [];
    return makes.map((value) => ({
      value: value === 'All Makes' ? '' : value,
      label: value === 'All Makes' ? t('filter.allMakes') : value,
    }));
  }, [filters.vehicleType, t]);

  const modelOptions = useMemo(() => {
    const brand = String(filters.brand || '').trim();
    if (!brand) return [];
    const models = modelsByMake[brand] ?? [];
    return [
      { value: '', label: t('filter.allModels') },
      ...models.map((value) => ({ value, label: value })),
    ];
  }, [filters.brand, t]);

  const priceOptions = useMemo(
    () =>
      priceRanges.map((value) => ({
        value: value === 'No limit' ? '' : value,
        label: value === 'No limit' ? t('filter.noLimit') : value,
      })),
    [t]
  );

  const registrationOptions = useMemo(
    () =>
      registrationYears.map((value) => {
        if (value === 'Any year') return { value: '', label: t('filter.anyYear') };
        if (value === 'Older') return { value, label: t('filter.older') };
        return { value, label: value };
      }),
    [t]
  );

  const regionOptions = useMemo(
    () => [
      { value: 'europe', label: `🇪🇺 ${t('filter.regions.europe')}` },
      { value: 'germany', label: `🇩🇪 ${t('filter.regions.germany')}` },
      { value: 'france', label: `🇫🇷 ${t('filter.regions.france')}` },
      { value: 'italy', label: `🇮🇹 ${t('filter.regions.italy')}` },
      { value: 'spain', label: `🇪🇸 ${t('filter.regions.spain')}` },
      { value: 'uk', label: `🇬🇧 ${t('filter.regions.uk')}` },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col">
          <span className="sr-only">{t('filter.make')}</span>
          <SelectFilter
            value={filters.brand}
            onChange={(value) =>
              setFilters('cars', { brand: value, model: defaults.model ?? '' })
            }
            options={makeOptions}
            placeholder={t('filter.make')}
          />
        </div>

        <div className="flex flex-col">
          <span className="sr-only">{t('filter.model')}</span>
          <SelectFilter
            value={filters.model ?? ''}
            onChange={(value) => setFilter('cars', 'model', value)}
            options={modelOptions}
            placeholder={filters.brand ? t('filter.allModels') : t('filter.selectMakeFirst')}
            disabled={!filters.brand}
          />
        </div>

        <div className="flex flex-col">
          <span className="sr-only">{t('searchBox.priceUpTo')}</span>
          <SelectFilter
            value={filters.price}
            onChange={(value) => setFilter('cars', 'price', value)}
            options={priceOptions}
            placeholder={t('searchBox.priceUpTo')}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col">
          <span className="sr-only">{t('searchBox.firstRegistrationFrom')}</span>
          <SelectFilter
            value={filters.registration}
            onChange={(value) => setFilter('cars', 'registration', value)}
            options={registrationOptions}
            placeholder={t('searchBox.firstRegistrationFrom')}
          />
        </div>

        <div className="flex flex-col">
          <span className="sr-only">{t('filter.region')}</span>
          <SelectFilter
            value={filters.region}
            onChange={(value) => setFilter('cars', 'region', value)}
            options={regionOptions}
          />
        </div>

        <div className="flex flex-col">
          <span className="sr-only">{t('filter.city')}</span>
          <TextFilter
            value={filters.city}
            onChange={(value) => setFilter('cars', 'city', value.trim())}
            placeholder={t('filter.cityPlaceholder')}
          />
        </div>

        <Button
          size="lg"
          className="h-11 w-full rounded-xl text-base"
          onClick={onCtaClick}
        >
          {t('searchBox.results', { count: resultsCount })}
        </Button>
      </div>
    </div>
  );
};

export default VehiclePrimaryFilters;
