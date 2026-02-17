import { IconSearch } from '@tabler/icons-react';
import type { TFunction } from 'i18next';

import { getDefaultFilters } from '../store/filters.defaults';
import type { FilterOption, FiltersConfig } from '../types/filters.types';

type SellersFilterOptions = {
  domains: FilterOption[];
  sellerTypes: FilterOption[];
  ratings: FilterOption[];
  listings: FilterOption[];
  cities: FilterOption[];
  sorts: FilterOption[];
};

type SellersFiltersConfigArgs = {
  t: TFunction<'sellers'>;
  options: SellersFilterOptions;
  total?: number;
  isLoading?: boolean;
};

export const createSellersFiltersConfig = ({
  t,
  options,
  total,
  isLoading,
}: SellersFiltersConfigArgs): FiltersConfig => {
  const footerText = isLoading
    ? t('filters.updating')
    : t('filters.available', { count: total ?? 0 });

  return {
    domain: 'sellers',
    defaults: getDefaultFilters('sellers'),
    containerClassName: 'sellers-filter',
    primaryClassName: 'filter-primary',
    advancedClassName: 'filter-advanced',
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
            id: 'search',
            placeholder: t('filters.searchPlaceholder'),
            icon: IconSearch,
          },
          {
            type: 'select',
            id: 'domain',
            options: options.domains,
          },
        ],
      },
    ],
    advancedGroups: [
      {
        id: 'sellerType',
        label: t('filters.sellerType'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'select',
            id: 'sellerType',
            options: options.sellerTypes,
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
            id: 'rating',
            options: options.ratings,
          },
        ],
      },
      {
        id: 'listings',
        label: t('filters.listings'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'select',
            id: 'listings',
            options: options.listings,
          },
        ],
      },
      {
        id: 'city',
        label: t('filters.city'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'select',
            id: 'city',
            options: options.cities,
          },
        ],
      },
      {
        id: 'sort',
        label: t('filters.sortBy'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'select',
            id: 'sort',
            options: options.sorts,
          },
        ],
      },
      {
        id: 'verified',
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'toggle',
            id: 'verifiedOnly',
            label: t('filters.verifiedOnly'),
            variant: 'checkbox',
          },
        ],
      },
    ],
  };
};
