import { IconSearch } from '@tabler/icons-react';
import type { TFunction } from 'i18next';

import { PART_CATEGORIES } from '@/parts/utils/parts.constants';
import { getDefaultFilters } from '../store/filters.defaults';
import type { FilterOption, FiltersConfig } from '../types/filters.types';

type PartsFilterOptions = {
  categories?: FilterOption[];
  conditions?: FilterOption[];
  sorts?: FilterOption[];
  brands?: FilterOption[];
  models?: FilterOption[];
  locations?: FilterOption[];
};

type PartsFiltersConfigArgs = {
  t: TFunction<'part'>;
  options: PartsFilterOptions;
  total?: number;
  isLoading?: boolean;
};

const translateCategories = (t: TFunction<'part'>) =>
  [
    { value: 'all', label: t('filter.allCategories') },
    ...PART_CATEGORIES.map((category) => ({
      value: category.value,
      label: t(`categories.${category.value}`),
    })),
  ] as FilterOption[];

const translateConditions = (t: TFunction<'part'>) =>
  [
    { value: 'all', label: t('filter.anyCondition') },
    { value: 'new', label: t('filter.new') },
    { value: 'used', label: t('filter.used') },
    { value: 'refurbished', label: t('filter.refurbished') },
  ] as FilterOption[];

const translateSorts = (t: TFunction<'part'>) =>
  [
    { value: 'RELEVANCE', label: t('filter.relevance') },
    { value: 'PRICE_ASC', label: t('filter.priceLowToHigh') },
    { value: 'PRICE_DESC', label: t('filter.priceHighToLow') },
    { value: 'NEWEST', label: t('filter.newestFirst') },
  ] as FilterOption[];

export const createPartsFiltersConfig = ({
  t,
  options,
  total,
  isLoading,
}: PartsFiltersConfigArgs): FiltersConfig => {
  const categories = options.categories ?? translateCategories(t);
  const conditions = options.conditions ?? translateConditions(t);
  const sorts = options.sorts ?? translateSorts(t);

  const footerText = isLoading
    ? t('list.updatingInventory')
    : t('list.partsAvailable', { count: total ?? 0 });

  return {
    domain: 'parts',
    defaults: getDefaultFilters('parts'),
    containerClassName: 'parts-filter',
    primaryClassName: 'filter-primary',
    advancedClassName: 'filter-advanced',
    showAdvancedToggle: true,
    advancedToggleLabel: t('filter.filters'),
    showReset: true,
    resetLabel: t('filter.reset'),
    footerText,
    primaryGroups: [
      {
        id: 'primary',
        controls: [
          {
            type: 'text',
            id: 'search',
            placeholder: t('filter.search'),
            icon: IconSearch,
          },
          {
            type: 'select',
            id: 'category',
            options: categories,
            placeholder: t('filter.allCategories'),
          },
        ],
      },
    ],
    advancedGroups: [
      {
        id: 'brand',
        label: t('filter.brand'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'select',
            id: 'brand',
            options: options.brands ?? [],
            placeholder: t('filter.allBrands'),
          },
        ],
      },
      {
        id: 'model',
        label: t('filter.model'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'select',
            id: 'model',
            options: options.models ?? [],
            placeholder: t('filter.allModels'),
            dependsOn: 'brand',
          },
        ],
      },
      {
        id: 'condition',
        label: t('filter.condition'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'select',
            id: 'condition',
            options: conditions,
            placeholder: t('filter.anyCondition'),
          },
        ],
      },
      {
        id: 'location',
        label: t('filter.location'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'select',
            id: 'location',
            options: options.locations ?? [],
            placeholder: t('filter.anyLocation'),
          },
        ],
      },
      {
        id: 'price',
        label: t('filter.priceFrom'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'range',
            id: 'priceRange',
            minKey: 'priceFrom',
            maxKey: 'priceTo',
            minPlaceholder: t('filter.from'),
            maxPlaceholder: t('filter.to'),
          },
        ],
      },
      {
        id: 'sort',
        label: t('filter.sortBy'),
        containerClassName: 'filter-section',
        controls: [
          { type: 'select', id: 'sort', options: sorts },
        ],
      },
    ],
    resetOnChange: {
      brand: ['model'],
    },
  };
};
