import { IconMapPin, IconSearch } from '@tabler/icons-react';
import type { TFunction } from 'i18next';

import { getDefaultFilters } from '../store/filters.defaults';
import type { FilterOption, FiltersConfig } from '../types/filters.types';

type ServicesFilterOptions = {
  serviceCodes: FilterOption[];
  brands: FilterOption[];
};

type ServicesFiltersConfigArgs = {
  t: TFunction<'services'>;
  options: ServicesFilterOptions;
  total?: number;
  isLoading?: boolean;
};

export const createServicesFiltersConfig = ({
  t,
  options,
  total,
  isLoading,
}: ServicesFiltersConfigArgs): FiltersConfig => {
  const footerText = isLoading
    ? t('filters.updating')
    : t('filters.available', { count: total ?? 0 });

  const SERVICE_TYPES: FilterOption[] = [
    { value: 'garage', label: t('filters.serviceTypes.garage') },
    { value: 'official', label: t('filters.serviceTypes.official') },
    { value: 'detailing', label: t('filters.serviceTypes.detailing') },
    { value: 'tire', label: t('filters.serviceTypes.tire') },
    { value: 'electric', label: t('filters.serviceTypes.electric') },
    { value: 'body', label: t('filters.serviceTypes.body') },
  ];

  const RATING_OPTIONS: FilterOption[] = [
    { value: '', label: t('filters.ratingOptions.any') },
    { value: '3', label: t('filters.ratingOptions.rating30') },
    { value: '3.5', label: t('filters.ratingOptions.rating35') },
    { value: '4', label: t('filters.ratingOptions.rating40') },
    { value: '4.5', label: t('filters.ratingOptions.rating45') },
  ];

  const RADIUS_OPTIONS: FilterOption[] = [
    { value: '', label: t('filters.radiusOptions.any') },
    { value: '5', label: t('filters.radiusOptions.5') },
    { value: '10', label: t('filters.radiusOptions.10') },
    { value: '25', label: t('filters.radiusOptions.25') },
    { value: '50', label: t('filters.radiusOptions.50') },
    { value: '100', label: t('filters.radiusOptions.100') },
  ];

  return {
    domain: 'services',
    defaults: getDefaultFilters('services'),
    containerClassName: 'services-filter',
    primaryClassName: 'filter-top-bar',
    advancedClassName: 'filter-panel',
    showAdvancedToggle: true,
    advancedToggleLabel: t('filters.filters'),
    showReset: true,
    resetLabel: t('filters.resetLabel'),
    footerText,
    primaryGroups: [
      {
        id: 'primary',
        controls: [
          {
            type: 'text',
            id: 'city',
            placeholder: t('filters.cityPlaceholder'),
            icon: IconMapPin,
          },
          { type: 'select', id: 'radiusKm', options: RADIUS_OPTIONS },
          { type: 'toggle', id: 'openNow', label: t('filters.openNow'), variant: 'switch' },
          {
            type: 'toggle',
            id: 'verifiedOnly',
            label: t('filters.verified'),
            variant: 'switch',
          },
        ],
      },
    ],
    advancedGroups: [
      {
        id: 'serviceType',
        label: t('filters.serviceType'),
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
        label: t('filters.brands'),
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
            placeholder: t('filters.searchBrandsPlaceholder'),
            searchIcon: IconSearch,
            listClassName: 'chips-grid',
            itemClassName: 'chip',
            itemActiveClassName: 'chip-selected',
          },
        ],
      },
      {
        id: 'serviceCodes',
        label: t('filters.services'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'chips',
            id: 'serviceCodes',
            options: options.serviceCodes ?? [],
            multiple: true,
            maxVisible: 6,
            showMoreLabel: (hidden) => t('filters.showMore', { count: hidden }),
            listClassName: 'chips-grid',
            itemClassName: 'chip',
            itemActiveClassName: 'chip-selected',
          },
        ],
      },
      {
        id: 'rating',
        label: t('filters.rating'),
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
