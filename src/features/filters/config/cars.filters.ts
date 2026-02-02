import '@/vehicles/components/AutoSearchFilter/AutoSearchFilter.scss';
import {
  IconBike,
  IconCamper,
  IconCar,
  IconDeviceDesktop,
  IconTruck,
} from '@tabler/icons-react';

import {
  makesByCategory,
  priceRanges,
  registrationYears,
} from '@/vehicles/components/AutoSearchFilter/options';
import { getDefaultFilters } from '../store/filters.defaults';
import type { FilterOption, FiltersConfig } from '../types/filters.types';

const vehicleTypeOptions: FilterOption[] = [
  { value: 'car', label: 'Car', icon: IconCar },
  { value: 'motorcycle', label: 'Motorcycle', icon: IconBike },
  { value: 'camper', label: 'Camper', icon: IconCamper },
  { value: 'truck', label: 'Truck', icon: IconTruck },
  { value: 'commercial', label: 'Commercial', icon: IconDeviceDesktop },
];

const regionOptions: FilterOption[] = [
  { value: 'europe', label: '🇪🇺 EU Europe' },
  { value: 'germany', label: '🇩🇪 Germany' },
  { value: 'france', label: '🇫🇷 France' },
  { value: 'italy', label: '🇮🇹 Italy' },
  { value: 'spain', label: '🇪🇸 Spain' },
  { value: 'uk', label: '🇬🇧 United Kingdom' },
];

const toOptions = (values: string[], emptyLabel: string) =>
  values.map((value) => ({
    value: value === emptyLabel ? '' : value,
    label: value,
  }));

const priceOptions = toOptions(priceRanges, 'No limit');
const registrationOptions = toOptions(registrationYears, 'Any year');

const buildMakeOptions = (vehicleType: string) =>
  toOptions(makesByCategory[vehicleType] || [], 'All Makes');

type CarsFiltersConfigArgs = {
  variant?: 'hero' | 'compact';
};

export const createCarsFiltersConfig = ({
  variant = 'hero',
}: CarsFiltersConfigArgs = {}): FiltersConfig => {
  const variantClass = `search-filter--${variant}`;

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
      label: 'Filters',
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
          { type: 'text', id: 'model', placeholder: 'Model' },
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
          { type: 'text', id: 'city', placeholder: 'City / ZIP' },
        ],
      },
    ],
    resetOnChange: {
      vehicleType: ['brand', 'model'],
    },
  };
};
