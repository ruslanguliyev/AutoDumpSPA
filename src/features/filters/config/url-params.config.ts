import type { FiltersUrlSyncConfig } from '../hooks/useFiltersUrlSync';
import type { FilterDomain, FilterValue } from '../types/filters.types';
import { Specialization } from '@/specialists/types/specialist.types';

const parseCommaSeparated = (value: string): FilterValue =>
  value.split(',').filter(Boolean);

const VALID_SPECIALIZATIONS = new Set(
  Object.values<string>(Specialization as Record<string, string>)
);

const parseSpecialization = (value: string): FilterValue =>
  VALID_SPECIALIZATIONS.has(value) ? value : '';

export const URL_PARAMS_CONFIG: Record<FilterDomain, FiltersUrlSyncConfig> = {
  cars: {
    paramMap: [
      { param: 'type', key: 'vehicleType' },
      { param: 'brand', key: 'brand' },
      { param: 'model', key: 'model' },
      { param: 'priceTo', key: 'price' },
      { param: 'yearFrom', key: 'registration' },
      { param: 'region', key: 'region' },
      { param: 'city', key: 'city' },
    ],
  },

  specialists: {
    paramMap: [
      { param: 'brand', key: 'brand' },
      { param: 'model', key: 'model' },
      { param: 'year', key: 'year' },
      { param: 'specialization', key: 'specialization', parse: parseSpecialization },
      { param: 'city', key: 'city' },
      { param: 'minRating', key: 'minRating' },
    ],
  },

  parts: {
    paramMap: [
      { param: 'q', key: 'search' },
      { param: 'category', key: 'category' },
      { param: 'brand', key: 'brand' },
      { param: 'model', key: 'model' },
      { param: 'condition', key: 'condition' },
      { param: 'priceFrom', key: 'priceFrom' },
      { param: 'priceTo', key: 'priceTo' },
      { param: 'location', key: 'location' },
      { param: 'sort', key: 'sort' },
    ],
  },

  sellers: {
    paramMap: [
      { param: 'q', key: 'search' },
      { param: 'domain', key: 'domain' },
      { param: 'type', key: 'sellerType' },
      { param: 'rating', key: 'rating' },
      { param: 'listings', key: 'listings' },
      { param: 'city', key: 'city' },
      { param: 'verified', key: 'verifiedOnly', parse: (v) => v === 'true' },
      { param: 'sort', key: 'sort' },
    ],
  },

  services: {
    paramMap: [
      { param: 'city', key: 'city' },
      { param: 'radius', key: 'radiusKm' },
      { param: 'types', key: 'serviceTypes', parse: parseCommaSeparated },
      { param: 'codes', key: 'serviceCodes', parse: parseCommaSeparated },
      { param: 'brands', key: 'brands', parse: parseCommaSeparated },
      { param: 'categories', key: 'categories', parse: parseCommaSeparated },
      { param: 'ratingFrom', key: 'ratingFrom' },
      { param: 'verified', key: 'verifiedOnly', parse: (v) => v === 'true' },
      { param: 'openNow', key: 'openNow', parse: (v) => v === 'true' },
    ],
  },
};

export const getUrlParamsConfig = (domain: FilterDomain): FiltersUrlSyncConfig =>
  URL_PARAMS_CONFIG[domain];
