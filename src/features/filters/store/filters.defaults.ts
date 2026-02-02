import type {
  DomainFilters,
  FilterDomain,
  FiltersByDomain,
} from '../types/filters.types';

export const FILTER_DEFAULTS: FiltersByDomain = {
  cars: {
    vehicleType: 'car',
    brand: '',
    model: '',
    price: '',
    registration: '',
    region: 'europe',
    city: '',
  },
  parts: {
    search: '',
    category: '',
    brand: '',
    model: '',
    condition: '',
    priceFrom: '',
    priceTo: '',
    location: '',
    sort: '',
  },
  sellers: {
    search: '',
    domain: 'all',
    sellerType: '',
    rating: '4.5',
    listings: 'any',
    city: '',
    verifiedOnly: false,
    sort: 'rating',
  },
  services: {
    city: '',
    radiusKm: '',
    serviceTypes: [],
    serviceCodes: [],
    brands: [],
    categories: [],
    ratingFrom: '',
    priceRange: [],
    verifiedOnly: false,
    openNow: false,
  },
};

export const cloneFilters = (filters: DomainFilters): DomainFilters =>
  Object.fromEntries(
    Object.entries(filters).map(([key, value]) => [
      key,
      Array.isArray(value) ? [...value] : value,
    ])
  );

export const getDefaultFilters = (domain: FilterDomain): DomainFilters =>
  cloneFilters(FILTER_DEFAULTS[domain]);

export const createDefaultFiltersState = (): FiltersByDomain => ({
  cars: getDefaultFilters('cars'),
  parts: getDefaultFilters('parts'),
  sellers: getDefaultFilters('sellers'),
  services: getDefaultFilters('services'),
});
