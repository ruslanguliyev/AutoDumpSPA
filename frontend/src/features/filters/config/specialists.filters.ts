import { IconMapPin, IconSearch } from '@tabler/icons-react';
import type { TFunction } from 'i18next';

import { Specialization } from '@/specialists/types/specialist.types';
import { getDefaultFilters } from '../store/filters.defaults';
import type { FilterOption, FiltersConfig } from '../types/filters.types';

type SpecialistsFiltersConfigArgs = {
  t: TFunction<'specialists'>;
  total?: number;
  isLoading?: boolean;
};

const buildSpecializationOptions = (
  t: TFunction<'specialists'>
): FilterOption[] => [
  { value: '', label: t('filters.specializationAny') },
  ...Object.values(Specialization).map((value) => ({
    value,
    label: t(`specializations.${value}`),
  })),
];

const buildRatingOptions = (t: TFunction<'specialists'>): FilterOption[] => [
  { value: '', label: t('filters.ratingOptions.any') },
  { value: '3', label: t('filters.ratingOptions.rating30') },
  { value: '3.5', label: t('filters.ratingOptions.rating35') },
  { value: '4', label: t('filters.ratingOptions.rating40') },
  { value: '4.5', label: t('filters.ratingOptions.rating45') },
];

export const createSpecialistsFiltersConfig = ({
  t,
  total,
  isLoading,
}: SpecialistsFiltersConfigArgs): FiltersConfig => {
  const footerText = isLoading
    ? t('filters.updating')
    : t('filters.available', { count: total ?? 0 });

  return {
    domain: 'specialists',
    defaults: getDefaultFilters('specialists'),
    containerClassName: 'specialists-filter',
    primaryClassName: 'filter-primary',
    advancedClassName: 'filter-advanced',
    showAdvancedToggle: true,
    advancedToggleLabel: t('filters.filters'),
    showReset: true,
    resetLabel: t('filters.clear'),
    footerText,
    primaryGroups: [
      {
        id: 'primary',
        controls: [
          {
            type: 'text',
            id: 'brand',
            placeholder: t('filters.searchPlaceholder'),
            icon: IconSearch,
          },
          {
            type: 'select',
            id: 'specialization',
            options: buildSpecializationOptions(t),
          },
        ],
      },
    ],
    advancedGroups: [
      {
        id: 'model',
        label: t('filters.model'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'text',
            id: 'model',
            placeholder: t('filters.modelPlaceholder'),
          },
        ],
      },
      {
        id: 'year',
        label: t('filters.year'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'text',
            id: 'year',
            placeholder: t('filters.yearPlaceholder'),
            inputType: 'number',
          },
        ],
      },
      {
        id: 'city',
        label: t('filters.city'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'text',
            id: 'city',
            placeholder: t('filters.cityPlaceholder'),
            icon: IconMapPin,
          },
        ],
      },
      {
        id: 'rating',
        label: t('filters.minRating'),
        containerClassName: 'filter-section',
        controls: [
          {
            type: 'select',
            id: 'minRating',
            options: buildRatingOptions(t),
          },
        ],
      },
    ],
  };
};
