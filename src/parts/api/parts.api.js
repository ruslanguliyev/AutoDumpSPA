import {
  sanitizeFilters,
  mapPartsPayloadToDomain,
  mapPartToEntity,
  matchesPartSearch,
} from '@/parts/utils/filterParts';
import brakePadsImg from '@/assets/images/brake-pads.jpg';
import headlightImg from '@/assets/images/headlight.jpg';
import oilFilterImg from '@/assets/images/oil-filter.jpg';
import airFilterImg from '@/assets/images/air-filter.jpg';
import frontBumperImg from '@/assets/images/front-bumper-suitable-for-mercedes-e-class.jpg';
import shockAbsorberImg from '@/assets/images/shock_absorber_vw.jpg';
import brakeDiskImg from '@/assets/images/brake-disk.jpg';
import sideMirrorImg from '@/assets/images/side-miror.jpg';
import sellerAvatarImg from '@/assets/images/png-clipart-user-profile-computer-icons-login-user-avatars-monochrome-black-thumbnail.png';

// ======================================================
// 🔧 MOCK MODE (только для DEV)
// ======================================================
const shouldUseMocks = () =>
  import.meta.env.DEV && String(import.meta.env.VITE_USE_PARTS_MOCKS ?? 'true') !== 'false';

const MOCK_SELLERS = [
  {
    id: 'dealer_01',
    name: 'BMW Cars AutoSalon',
    type: 'dealer',
    hasPublicPage: true,
    rating: 4.8,
    votes: 312,
    logo: sellerAvatarImg,
  },
  {
    id: 'dealer_02',
    name: 'LuxuryCars AutoSalon',
    type: 'dealer',
    hasPublicPage: true,
    rating: 4.6,
    votes: 188,
    logo: sellerAvatarImg,
  },
  {
    id: 'private_03',
    name: 'Private Seller',
    type: 'private',
    hasPublicPage: false,
    rating: 4.7,
    votes: 246,
    logo: sellerAvatarImg,
  },
];

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
      discountPercent: 62,
      rating: 4.77,
      reviewsCount: 90,
      description: 'Front brake pads OEM',
      price: 120,
      currency: '$',
      oemCode: 'BMW-123',
      compatibility: ['X5 E70', 'X5 F15'],
      stock: 5,
      location: 'Berlin',
      imageUrl: brakePadsImg,
      seller: MOCK_SELLERS[1],
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
      discountPercent: 62,
      rating: 4.77,
      reviewsCount: 90,
      currency: '$',
      oemCode: null,
      compatibility: ['C200', 'C220'],
      stock: 1,
      location: 'Hamburg',
      imageUrl: headlightImg,
      seller: MOCK_SELLERS[0],
    },
    {
      id: '3',
      name: 'Oil filter',
      category: 'Engine',
      brand: 'BMW',
      model: '3 Series',
      condition: 'New',
      discountPercent: 62,
      rating: 4.77,
      reviewsCount: 90,
      description: 'Original oil filter OEM',
      price: 25,
      currency: '$',
      oemCode: 'BMW-OF-456',
      compatibility: ['E90', 'E91', 'F30'],
      stock: 12,
      location: 'Munich',
      imageUrl: oilFilterImg,
      seller: MOCK_SELLERS[2],
    },
    {
      id: '4',
      name: 'Air filter',
      category: 'Engine',
      brand: 'Audi',
      model: 'A4',
      condition: 'New',
      discountPercent: 62,
      rating: 4.77,
      reviewsCount: 90,
      description: 'High performance air filter',
      price: 40,
      currency: '$',
      oemCode: 'AUDI-AF-778',
      compatibility: ['B8', 'B9'],
      stock: 7,
      location: 'Stuttgart',
      imageUrl: airFilterImg,
      seller: MOCK_SELLERS[0],
    },
    {
      id: '5',
      name: 'Front bumper',
      category: 'Body',
      brand: 'Mercedes',
      model: 'E-Class',
      condition: 'Used',
      discountPercent: 62,
      rating: 4.77,
      reviewsCount: 90,
      description: 'Front bumper with minor scratches',
      price: 320,
      currency: '$',
      oemCode: null,
      compatibility: ['W213'],
      stock: 1,
      location: 'Frankfurt',
      imageUrl: frontBumperImg,
      seller: MOCK_SELLERS[1],
    },
    {
      id: '6',
      name: 'Shock absorber',
      category: 'Suspension',
      brand: 'Volkswagen',
      model: 'Golf',
      condition: 'New',
      discountPercent: 62,
      rating: 4.77,
      reviewsCount: 90,
      description: 'Rear shock absorber OEM',
      price: 95,
      currency: '$',
      oemCode: 'VW-SA-332',
      compatibility: ['Golf 7', 'Golf 8'],
      stock: 9,
      location: 'Cologne',
      imageUrl: shockAbsorberImg,
      seller: MOCK_SELLERS[2],
    },
    {
      id: '7',
      name: 'Brake disc',
      category: 'Brakes',
      brand: 'BMW',
      model: '5 Series',
      condition: 'New',
      discountPercent: 62,
      rating: 4.77,
      reviewsCount: 90,
      description: 'Ventilated brake disc front',
      price: 150,
      currency: '$',
      oemCode: 'BMW-BD-889',
      compatibility: ['F10', 'G30'],
      stock: 4,
      location: 'Berlin',
      imageUrl: brakeDiskImg,
      seller: MOCK_SELLERS[1],
    },
    {
      id: '8',
      name: 'Side mirror',
      category: 'Exterior',
      brand: 'Toyota',
      model: 'Camry',
      condition: 'Used',
      discountPercent: 62,
      rating: 4.77,
      reviewsCount: 90,
      description: 'Left side mirror, electrically adjustable',
      price: 110,
      currency: '$',
      oemCode: null,
      compatibility: ['Camry XV50', 'Camry XV70'],
      stock: 2,
      location: 'Düsseldorf',
      imageUrl: sideMirrorImg,
      seller: MOCK_SELLERS[0],
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

const graphqlRequest = async ({ query, variables }) => {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed (${res.status})`);
  }

  const json = await res.json();
  const firstErrorMessage = json?.errors?.[0]?.message;
  if (firstErrorMessage) throw new Error(firstErrorMessage);

  return json?.data ?? null;
};

const fetchPartsFromGraphql = async (filters) => {
  const data = await graphqlRequest({
    query: PARTS_QUERY,
    variables: { filter: buildPartsFilterInput(filters) },
  });

  return mapPartsPayloadToDomain(data?.parts);
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

// ======================================================
// 🔎 PART DETAILS
// ======================================================
const PART_BY_ID_QUERY = `
query Part($id: ID!) {
  part(id: $id) {
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
}
`;

const fetchPartByIdFromGraphql = async (id) => {
  // Best-case: backend supports `part(id)`
  try {
    const data = await graphqlRequest({
      query: PART_BY_ID_QUERY,
      variables: { id: String(id) },
    });
    if (data?.part) return mapPartToEntity(data.part);
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);

    // Fallback: schema might not have `part(id)` yet.
    // We intentionally keep this fallback isolated to the API layer,
    // so UI stays stable while backend evolves.
    if (!msg.toLowerCase().includes('cannot query field') || !msg.includes('part')) {
      throw e;
    }

    const payload = await fetchPartsFromGraphql(
      sanitizeFilters({ limit: 10_000, offset: 0 })
    );

    const hit = payload?.items?.find((item) => String(item.id) === String(id));
    return hit ? mapPartToEntity(hit) : null;
  }
};

/**
 * Fetch a single part by id and convert to domain entity.
 * In DEV returns mocked data for UI development.
 */
export const fetchPartById = async (id) => {
  const safeId = String(id ?? '').trim();
  if (!safeId) return null;

  if (shouldUseMocks()) {
    const item = (MOCK_PAYLOAD?.items ?? []).find((p) => String(p.id) === safeId);
    return item ? mapPartToEntity(item) : null;
  }

  return await fetchPartByIdFromGraphql(safeId);
};
