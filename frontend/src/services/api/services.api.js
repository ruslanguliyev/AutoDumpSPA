import { gqlRequest } from '@/lib/graphql';
import { MOCK_SERVICES } from './graphql/mocks/services.mocks.js';

const GET_SERVICE_CENTERS_QUERY = `
query GetServiceCenters($city: String) {
  serviceCenters(city: $city) {
    id slug name description type
    city phone website logoUrl coverImage
    categories supportedBrands rating reviewsCount verified
  }
}
`;

const GET_SERVICE_CENTER_QUERY = `
query GetServiceCenter($id: String!) {
  serviceCenter(id: $id) {
    id slug name legalName description type
    city address phone whatsapp website
    logoUrl coverImage gallery
    categories supportedBrands
    rating reviewsCount verified isActive
    schedule contacts
    services {
      id code title category
      priceFrom priceTo currency durationMin
      applicableBrands popular
    }
  }
}
`;

const GET_SERVICE_CENTER_BY_SLUG_QUERY = `
query GetServiceCenterBySlug($slug: String!) {
  serviceCenterBySlug(slug: $slug) {
    id slug name legalName description type
    city address phone whatsapp website
    logoUrl coverImage gallery
    categories supportedBrands
    rating reviewsCount verified isActive
    schedule contacts
    services {
      id code title category
      priceFrom priceTo currency durationMin
      applicableBrands popular
    }
  }
}
`;

const mapServiceCenterRow = (row) => ({
  id: row.id,
  slug: row.slug ?? null,
  name: row.name,
  legalName: row.legalName ?? null,
  description: row.description ?? null,
  type: row.type ?? null,
  location: {
    city: row.city,
    address: row.address ?? null,
    lat: null,
    lng: null,
  },
  categories: row.categories ?? [],
  supportedBrands: row.supportedBrands ?? [],
  rating: row.rating,
  reviewsCount: row.reviewsCount ?? 0,
  verified: row.verified,
  isActive: row.isActive ?? true,
  phone: row.phone ?? null,
  whatsapp: row.whatsapp ?? null,
  website: row.website ?? null,
  media: {
    logo: row.logoUrl ?? null,
    cover: row.coverImage ?? null,
    gallery: row.gallery ?? [],
  },
  schedule:
    typeof row.schedule === 'string'
      ? JSON.parse(row.schedule)
      : (row.schedule ?? null),
  contacts:
    typeof row.contacts === 'string'
      ? JSON.parse(row.contacts)
      : (row.contacts ?? null),
  services: (row.services ?? []).map((s) => ({
    id: s.id,
    code: s.code,
    title: s.title,
    category: s.category,
    priceFrom: s.priceFrom != null ? Number(s.priceFrom) : null,
    priceTo: s.priceTo != null ? Number(s.priceTo) : null,
    currency: s.currency,
    durationMin: s.durationMin,
    applicableBrands: s.applicableBrands ?? [],
    popular: s.popular,
  })),
});

// ======================================================
// 🔧 MOCK MODE
// ======================================================
const shouldUseMocks = () => {
  const flag = import.meta.env.VITE_USE_SERVICES_MOCKS;
  if (flag !== undefined) return String(flag) !== 'false';
  return false; // use real backend by default
};

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
  if (shouldUseMocks()) {
    const filtered = applyMockFiltering(MOCK_SERVICES, filters);
    return filtered;
  }

  try {
    const city =
      filters.city === '' || filters.city == null
        ? null
        : String(filters.city).trim() || null;
    const data = await gqlRequest(GET_SERVICE_CENTERS_QUERY, { city });
    const rows = data?.serviceCenters ?? [];
    return rows.map((row) => mapServiceCenterRow({ ...row, services: [] }));
  } catch {
    return [];
  }
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

  try {
    const data = await gqlRequest(GET_SERVICE_CENTER_QUERY, { id: safeId });
    const row = data?.serviceCenter;
    if (!row) return null;
    return mapServiceCenterRow(row);
  } catch {
    return null;
  }
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

  try {
    const data = await gqlRequest(GET_SERVICE_CENTER_BY_SLUG_QUERY, {
      slug: safeSlug,
    });
    const row = data?.serviceCenterBySlug;
    if (row) return mapServiceCenterRow(row);
  } catch {
    // fall through to id lookup
  }

  try {
    return await getServiceById(safeSlug);
  } catch {
    return null;
  }
};

/**
 * Fetch services by a list of ids.
 */
export const getServicesByIds = async (ids = []) => {
  const safeIds = Array.from(
    new Set((ids ?? []).map((id) => String(id).trim()).filter(Boolean))
  );
  if (safeIds.length === 0) return [];

  const services = await getServices();
  return services.filter((service) => safeIds.includes(String(service.id)));
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
