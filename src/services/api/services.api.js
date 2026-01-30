import { MOCK_SERVICES } from './graphql/mocks/services.mocks.js';

// ======================================================
// 🔧 MOCK MODE (только для DEV)
// ======================================================
const shouldUseMocks = () =>
  import.meta.env.DEV && String(import.meta.env.VITE_USE_SERVICES_MOCKS ?? 'true') !== 'false';

const normalize = (value) => String(value ?? '').trim().toLowerCase();

const applyMockFiltering = (services, filters) => {
  const city = normalize(filters.city);
  const serviceTypes = Array.isArray(filters.serviceTypes) ? filters.serviceTypes : [];
  const serviceCodes = Array.isArray(filters.serviceCodes) ? filters.serviceCodes : [];
  const brands = Array.isArray(filters.brands) ? filters.brands : [];
  const categories = Array.isArray(filters.categories) ? filters.categories : [];
  const ratingFrom =
    filters.ratingFrom === '' || filters.ratingFrom === null || filters.ratingFrom === undefined
      ? null
      : Number(filters.ratingFrom);
  const priceRange = Array.isArray(filters.priceRange) ? filters.priceRange : [];
  const verifiedOnly = filters.verifiedOnly === true;

  let filtered = services.filter((service) => {
    // City filter - partial match
    if (city) {
      const serviceCity = normalize(service.location?.city);
      if (!serviceCity || !serviceCity.includes(city)) return false;
    }

    // Service types filter
    if (serviceTypes.length > 0 && !serviceTypes.includes(service.type)) return false;

    // Service codes filter
    if (serviceCodes.length > 0) {
      const hasMatchingCode = service.services?.some((item) =>
        serviceCodes.includes(item.code)
      );
      if (!hasMatchingCode) return false;
    }

    // Brands filter
    if (brands.length > 0) {
      const hasMatchingBrand = service.supportedBrands?.some((brand) =>
        brands.includes(brand)
      );
      if (!hasMatchingBrand) return false;
    }

    // Categories filter
    if (categories.length > 0) {
      const hasMatchingCategory = service.categories?.some((cat) =>
        categories.includes(cat)
      );
      if (!hasMatchingCategory) return false;
    }

    // Rating filter
    if (Number.isFinite(ratingFrom) && ratingFrom !== null) {
      const rating = Number(service.rating ?? 0);
      if (rating < ratingFrom) return false;
    }

    // Price range filter
    if (priceRange.length > 0) {
      const servicePriceRange = service.priceRange ?? 0;
      if (!priceRange.includes(servicePriceRange)) return false;
    }

    // Verified only filter
    if (verifiedOnly && !service.verified) return false;

    return true;
  });

  return filtered;
};

// ======================================================
// 🚀 PUBLIC API
// ======================================================
/**
 * Fetch services from mocks or GraphQL.
 * In DEV returns mocked data for UI development.
 */
export const getServices = async (filters = {}) => {
  // 🟢 MOCK DATA (DEV)
  if (shouldUseMocks()) {
    const filtered = applyMockFiltering(MOCK_SERVICES, filters);
    return filtered;
  }

  // 🔌 REAL BACKEND (PROD / LATER)
  // This would call GraphQL in the future
  throw new Error('GraphQL backend not implemented yet. Use mocks in DEV mode.');
};

/**
 * Fetch a single service by id and convert to domain entity.
 * In DEV returns mocked data for UI development.
 */
export const getServiceById = async (id) => {
  const safeId = String(id ?? '').trim();
  if (!safeId) return null;

  if (shouldUseMocks()) {
    const service = MOCK_SERVICES.find((s) => String(s.id) === safeId);
    return service || null;
  }

  // 🔌 REAL BACKEND (PROD / LATER)
  throw new Error('GraphQL backend not implemented yet. Use mocks in DEV mode.');
};

/**
 * Fetch a single service by slug and convert to domain entity.
 * In DEV returns mocked data for UI development.
 */
export const getServiceBySlug = async (slug) => {
  const safeSlug = String(slug ?? '').trim();
  if (!safeSlug) return null;

  if (shouldUseMocks()) {
    const service = MOCK_SERVICES.find((s) => String(s.slug) === safeSlug);
    return service || null;
  }

  // 🔌 REAL BACKEND (PROD / LATER)
  throw new Error('GraphQL backend not implemented yet. Use mocks in DEV mode.');
};

/**
 * Fetch services by brand (for VehicleDetail integration)
 */
export const getServicesByBrand = async (brand, filters = {}) => {
  return getServices({
    ...filters,
    brands: [brand],
  });
};

/**
 * Fetch services by service code (for PartDetail integration)
 */
export const getServicesByServiceCode = async (serviceCode, filters = {}) => {
  return getServices({
    ...filters,
    serviceCodes: [serviceCode],
  });
};
