import { IconMapPin, IconSearch } from '@tabler/icons-react';

import { getDefaultFilters } from '../store/filters.defaults';
import type { FilterOption, FiltersConfig } from '../types/filters.types';

const SERVICE_TYPES: FilterOption[] = [
  { value: 'garage', label: 'Garage' },
  { value: 'official', label: 'Official' },
  { value: 'detailing', label: 'Detailing' },
  { value: 'tire', label: 'Tire' },
  { value: 'electric', label: 'Electric' },
  { value: 'body', label: 'Body' },
];

const RATING_OPTIONS: FilterOption[] = [
  { value: '', label: 'Any rating' },
  { value: '3', label: '3.0+' },
  { value: '3.5', label: '3.5+' },
  { value: '4', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
];

const RADIUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'Any distance' },
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '25', label: '25 km' },
  { value: '50', label: '50 km' },
  { value: '100', label: '100 km' },
];

type ServicesFilterOptions = {
  serviceCodes: FilterOption[];
  brands: FilterOption[];
};

type ServicesFiltersConfigArgs = {
  options: ServicesFilterOptions;
  total?: number;
  isLoading?: boolean;
};

const pluralize = (value: number, label: string) =>
  `${value} ${label}${value === 1 ? '' : 's'}`;

export const createServicesFiltersConfig = ({
  options,
  total,
  isLoading,
}: ServicesFiltersConfigArgs): FiltersConfig => {
  const footerText = isLoading
    ? 'Updating services…'
    : `${pluralize(total ?? 0, 'service')} available`;

  return {
    domain: 'services',
    defaults: getDefaultFilters('services'),
    containerClassName: 'services-filter',
    primaryClassName: 'filter-top-bar',
    advancedClassName: 'filter-panel',
    showAdvancedToggle: true,
    advancedToggleLabel: 'Filters',
    showReset: true,
    resetLabel: 'Reset filters',
    footerText,
    primaryGroups: [
      {
        id: 'primary',
        controls: [
          {
            type: 'text',
            id: 'city',
            placeholder: 'City',
            icon: IconMapPin,
          },
          { type: 'select', id: 'radiusKm', options: RADIUS_OPTIONS },
          { type: 'toggle', id: 'openNow', label: 'Open now', variant: 'switch' },
          {
            type: 'toggle',
            id: 'verifiedOnly',
            label: 'Verified',
            variant: 'switch',
          },
        ],
      },
    ],
    advancedGroups: [
      {
        id: 'serviceType',
        label: 'Service Type',
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'chips',
            id: 'serviceTypes',
            options: SERVICE_TYPES,
            multiple: true,
            listClassName: 'chips-row',
            itemClassName: 'chip',
            itemActiveClassName: 'chip-selected',
          },
        ],
      },
      {
        id: 'brands',
        label: 'Brands',
        containerClassName: 'collapsible-section',
        collapsible: true,
        defaultCollapsed: true,
        controls: [
          {
            type: 'chips',
            id: 'brands',
            options: options.brands ?? [],
            multiple: true,
            searchable: true,
            placeholder: 'Search brands...',
            searchIcon: IconSearch,
            listClassName: 'chips-grid',
            itemClassName: 'chip',
            itemActiveClassName: 'chip-selected',
          },
        ],
      },
      {
        id: 'serviceCodes',
        label: 'Services',
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'chips',
            id: 'serviceCodes',
            options: options.serviceCodes ?? [],
            multiple: true,
            maxVisible: 6,
            showMoreLabel: (hidden) => `Show more (${hidden} more)`,
            listClassName: 'chips-grid',
            itemClassName: 'chip',
            itemActiveClassName: 'chip-selected',
          },
        ],
      },
      {
        id: 'rating',
        label: 'Rating',
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'select',
            id: 'ratingFrom',
            options: RATING_OPTIONS,
          },
        ],
      },
    ],
  };
};
