import {
  sanitizeFilters,
  mapPartsPayloadToDomain,
  matchesPartSearch,
} from '@/domain/parts/filterParts';

// ======================================================
// 🔧 MOCK MODE (только для DEV)
// ======================================================
const shouldUseMocks = () =>
  import.meta.env.DEV && String(import.meta.env.VITE_USE_PARTS_MOCKS ?? 'true') !== 'false';

const MOCK_PAYLOAD = {
  total: 2,
  items: [
    {
      id: '1',
      name: 'Brake pads',
      category: 'Brakes',
      brand: 'BMW',
      model: 'X5',
      condition: 'New',
      description: 'Front brake pads OEM',
      price: 120,
      currency: '$',
      oemCode: 'BMW-123',
      compatibility: ['X5 E70', 'X5 F15'],
      stock: 5,
      location: 'Berlin',
      imageUrl: null,
    },
    {
      id: '2',
      name: 'Headlight',
      category: 'Lighting',
      brand: 'Mercedes',
      model: 'C-Class',
      condition: 'Used',
      description: 'Left headlight',
      price: 180,
      currency: '$',
      oemCode: null,
      compatibility: ['C200', 'C220'],
      stock: 1,
      location: 'Hamburg',
      imageUrl: null,
    },
  ],
};

// ======================================================
// 🔧 HELPERS
// ======================================================
const buildPartsFilterInput = (filters) => ({
  search: filters.search || null,
  category: filters.category === 'all' ? null : filters.category,
  brand: filters.brand || null,
  model: filters.model || null,
  condition: filters.condition === 'all' ? null : filters.condition,
  priceFrom: filters.priceFrom === '' ? null : filters.priceFrom,
  priceTo: filters.priceTo === '' ? null : filters.priceTo,
  location: filters.location || null,
  sort: filters.sort || null,
  limit: filters.limit,
  offset: filters.offset,
});

const normalize = (value) => String(value ?? '').trim().toLowerCase();

const applyMockFiltering = (payload, filters) => {
  const category = normalize(filters.category);
  const brand = normalize(filters.brand);
  const model = normalize(filters.model);
  const condition = normalize(filters.condition);
  const location = normalize(filters.location);

  const priceFrom =
    filters.priceFrom === '' || filters.priceFrom === null || filters.priceFrom === undefined
      ? null
      : Number(filters.priceFrom);
  const priceTo =
    filters.priceTo === '' || filters.priceTo === null || filters.priceTo === undefined
      ? null
      : Number(filters.priceTo);

  let items = (payload?.items ?? []).filter((item) => {
    if (!matchesPartSearch(item, filters.search)) return false;

    if (category && category !== 'all' && normalize(item.category) !== category) return false;
    if (brand && !normalize(item.brand).includes(brand)) return false;
    if (model && !normalize(item.model).includes(model)) return false;
    if (condition && condition !== 'all' && normalize(item.condition) !== condition) return false;
    if (location && !normalize(item.location).includes(location)) return false;

    const price = Number(item.price ?? 0);
    if (Number.isFinite(priceFrom) && priceFrom !== null && price < priceFrom) return false;
    if (Number.isFinite(priceTo) && priceTo !== null && price > priceTo) return false;

    return true;
  });

  if (filters.sort === 'PRICE_ASC') items = [...items].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  if (filters.sort === 'PRICE_DESC') items = [...items].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));

  const total = items.length;
  const offset = Number(filters.offset ?? 0);
  const limit = Number(filters.limit ?? 20);
  items = items.slice(offset, offset + limit);

  return { total, items };
};

const PARTS_QUERY = `
query Parts($filter: PartsFilterInput) {
  parts(filter: $filter) {
    items {
      id
      name
      category
      brand
      model
      condition
      description
      price
      currency
      oemCode
      compatibility
      stock
      location
      imageUrl
    }
    total
  }
}
`;

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

const fetchPartsFromGraphql = async (filters) => {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: PARTS_QUERY,
      variables: { filter: buildPartsFilterInput(filters) },
    }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed (${res.status})`);
  }

  const json = await res.json();
  const firstErrorMessage = json?.errors?.[0]?.message;
  if (firstErrorMessage) throw new Error(firstErrorMessage);

  return mapPartsPayloadToDomain(json?.data?.parts);
};

// ======================================================
// 🚀 PUBLIC API
// ======================================================
/**
 * Fetch parts from GraphQL and convert to domain entities.
 * In DEV returns mocked data for UI development.
 */
export const fetchParts = async (filters) => {
  const normalized = sanitizeFilters(filters);

  // 🟢 MOCK DATA (DEV)
  if (shouldUseMocks()) {
    const payload = applyMockFiltering(MOCK_PAYLOAD, normalized);
    return mapPartsPayloadToDomain(payload);
  }

  // 🔌 REAL BACKEND (PROD / LATER)
  return await fetchPartsFromGraphql(normalized);
};
