import { IconSearch } from '@tabler/icons-react';

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
  options: SellersFilterOptions;
  total?: number;
  isLoading?: boolean;
};

const pluralize = (value: number, label: string) =>
  `${value} ${label}${value === 1 ? '' : 's'}`;

export const createSellersFiltersConfig = ({
  options,
  total,
  isLoading,
}: SellersFiltersConfigArgs): FiltersConfig => {
  const footerText = isLoading
    ? 'Updating sellers…'
    : `${pluralize(total ?? 0, 'seller')} available`;

  return {
    domain: 'sellers',
    defaults: getDefaultFilters('sellers'),
    containerClassName: 'sellers-filter',
    primaryClassName: 'filter-primary',
    advancedClassName: 'filter-advanced',
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
            id: 'search',
            placeholder: 'Search sellers (name, city)',
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
        label: 'Seller type',
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
        label: 'Rating',
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
        label: 'Listings',
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
        label: 'City',
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
        label: 'Sort by',
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
            label: 'Verified sellers only',
            variant: 'checkbox',
          },
        ],
      },
    ],
  };
};
