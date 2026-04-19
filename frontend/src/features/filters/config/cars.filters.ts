import '@/vehicles/components/AutoSearchFilter/AutoSearchFilter.scss';
import {
  IconBike,
  IconCamper,
  IconCar,
  IconDeviceDesktop,
  IconTruck,
} from '@tabler/icons-react';
import type { TFunction } from 'i18next';

import {
  makesByCategory,
  priceRanges,
  registrationYears,
} from '@/vehicles/components/AutoSearchFilter/options';
import { getDefaultFilters } from '../store/filters.defaults';
import type { FilterOption, FiltersConfig } from '../types/filters.types';

type CarsFiltersConfigArgs = {
  t: TFunction<'vehicle'>;
  variant?: 'hero' | 'compact';
};

export const createCarsFiltersConfig = ({
  t,
  variant = 'hero',
}: CarsFiltersConfigArgs): FiltersConfig => {
  const variantClass = `search-filter--${variant}`;

  const vehicleTypeOptions: FilterOption[] = [
    { value: 'car', label: t('filter.car'), icon: IconCar },
    { value: 'motorcycle', label: t('filter.motorcycle'), icon: IconBike },
    { value: 'camper', label: t('filter.camper'), icon: IconCamper },
    { value: 'truck', label: t('filter.truck'), icon: IconTruck },
    { value: 'commercial', label: t('filter.commercial'), icon: IconDeviceDesktop },
  ];

  const regionOptions: FilterOption[] = [
    { value: 'europe', label: `🇪🇺 ${t('filter.regions.europe')}` },
    { value: 'germany', label: `🇩🇪 ${t('filter.regions.germany')}` },
    { value: 'france', label: `🇫🇷 ${t('filter.regions.france')}` },
    { value: 'italy', label: `🇮🇹 ${t('filter.regions.italy')}` },
    { value: 'spain', label: `🇪🇸 ${t('filter.regions.spain')}` },
    { value: 'uk', label: `🇬🇧 ${t('filter.regions.uk')}` },
  ];

  const toPriceOptions = (): FilterOption[] =>
    priceRanges.map((value) => ({
      value: value === 'No limit' ? '' : value,
      label: value === 'No limit' ? t('filter.noLimit') : value,
    }));

  const toRegistrationOptions = (): FilterOption[] =>
    registrationYears.map((value) => {
      if (value === 'Any year') return { value: '', label: t('filter.anyYear') };
      if (value === 'Older') return { value, label: t('filter.older') };
      return { value, label: value };
    });

  const priceOptions = toPriceOptions();
  const registrationOptions = toRegistrationOptions();

  const buildMakeOptions = (vehicleType: string): FilterOption[] => {
    const makes = makesByCategory[vehicleType] || [];
    return makes.map((value) => ({
      value: value === 'All Makes' ? '' : value,
      label: value === 'All Makes' ? t('filter.allMakes') : value,
    }));
  };

  return {
    domain: 'cars',
    defaults: getDefaultFilters('cars'),
    containerClassName: `search-filter ${variantClass}`,
    contentClassName: 'search-filter__content',
    contentInnerClassName: 'search-filter__inner',
    contentOpenClassName: 'is-open',
    primaryClassName: 'search-filter__form',
    mobileToggle: {
      show: true,
      label: t('filter.filters'),
      withCount: true,
    },
    primaryGroups: [
      {
        id: 'vehicleType',
        controls: [
          {
            type: 'chips',
            id: 'vehicleType',
            options: vehicleTypeOptions,
            listClassName: 'search-filter__nav',
            itemClassName: 'search-filter__nav-item',
            itemActiveClassName: 'is-active',
          },
        ],
      },
      {
        id: 'row1',
        containerClassName: 'search-filter__row',
        controls: [
          {
            type: 'select',
            id: 'brand',
            options: (filters) =>
              buildMakeOptions(String(filters.vehicleType || 'car')),
          },
          { type: 'text', id: 'model', placeholder: t('filter.modelPlaceholder') },
          { type: 'select', id: 'price', options: priceOptions },
        ],
      },
      {
        id: 'row2',
        containerClassName: 'search-filter__row',
        controls: [
          {
            type: 'select',
            id: 'registration',
            options: registrationOptions,
          },
          { type: 'select', id: 'region', options: regionOptions },
          { type: 'text', id: 'city', placeholder: t('filter.cityPlaceholder') },
        ],
      },
    ],
    resetOnChange: {
      vehicleType: ['brand', 'model'],
    },
  };
};
