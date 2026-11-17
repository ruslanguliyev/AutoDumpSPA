import { gqlRequest } from '@/lib/graphql';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { VEHICLE_CATALOG_LIMIT } from '@/shared/constants/catalogLimits';

const VEHICLES_QUERY = `
query Vehicles($filter: VehiclesFilterInput) {
  vehicles(filter: $filter) {
    items {
      id brand model version year mileage fuel transmission
      engineVolume power drive condition color vehicleType bodyType
      purpose rental { deposit minDays maxDays kmPerDay minDriverAge }
      price currency location description imageUrls
      isHot isCreditAvailable isBarterAvailable
      hasDamage isRepainted wasInAccident
      ownersCount seatsCount marketRegion
      seller { id name type hasPublicPage verified rating city phone logo }
      promotionTier viewsCount bumpedAt
    }
    total
  }
}
`;

const VEHICLE_BY_ID_QUERY = `
query VehicleById($id: String!) {
  vehicleById(id: $id) {
    id listingId brand model version year mileage vin fuel transmission
    engineVolume power drive condition color vehicleType bodyType
    purpose rental { deposit minDays maxDays kmPerDay minDriverAge }
    price currency location description imageUrls
    isHot isCreditAvailable isBarterAvailable
    hasDamage isRepainted wasInAccident
    ownersCount seatsCount marketRegion
    seller { id name type hasPublicPage verified rating city phone logo }
    promotionTier viewsCount bumpedAt
  }
}
`;

const mapVehicle = (row) => ({
  id: row.id,
  listingId: row.listingId ?? null,
  brand: row.brand,
  model: row.model,
  version: row.version ?? null,
  year: row.year,
  mileage: row.mileage,
  vin: row.vin ?? null,
  fuel: row.fuel,
  transmission: row.transmission,
  engineVolume: row.engineVolume,
  power: row.power,
  drive: row.drive ?? null,
  condition: row.condition ?? 'used',
  color: row.color ?? null,
  vehicleType: row.vehicleType ?? 'car',
  bodyType: row.bodyType ?? null,
  purpose: row.purpose ?? 'SALE',
  rental: row.rental ?? null,
  price: row.price != null ? Number(row.price) : null,
  currency: row.currency ?? 'AZN',
  location: row.location ?? null,
  description: row.description ?? null,
  image: (row.imageUrls ?? []).map(resolveMediaUrl).filter(Boolean),
  imageUrls: (row.imageUrls ?? []).map(resolveMediaUrl).filter(Boolean),
  isHot: row.isHot ?? false,
  isCreditAvailable: row.isCreditAvailable ?? false,
  isBarterAvailable: row.isBarterAvailable ?? false,
  hasDamage: row.hasDamage ?? false,
  isRepainted: row.isRepainted ?? false,
  wasInAccident: row.wasInAccident ?? false,
  ownersCount: row.ownersCount ?? null,
  owners: row.ownersCount ?? null,
  seatsCount: row.seatsCount ?? null,
  marketRegion: row.marketRegion ?? null,
  seller: row.seller ?? null,
  promotionTier: row.promotionTier ?? null,
  engine: `${row.engineVolume}L • ${row.power} HP`,
  status: 'available',
  views: row.viewsCount ?? null,
  bumpedAt: row.bumpedAt ?? null,
  postedAt: null,
  sellerNote: row.description ?? null,
});

const buildVehiclesFilterInput = (filters = {}) => ({
  brand: filters.brand || null,
  model: filters.model || null,
  sellerId: filters.sellerId || null,
  purpose: filters.purpose || null,
  availableFrom: filters.availableFrom || null,
  availableTo: filters.availableTo || null,
  yearFrom: filters.yearFrom ?? null,
  yearTo: filters.yearTo ?? null,
  priceFrom: filters.priceFrom ?? null,
  priceTo: filters.priceTo ?? null,
  condition:
    !filters.condition || filters.condition === 'all'
      ? null
      : filters.condition,
  fuel: filters.fuel?.length === 1 ? filters.fuel[0] : null,
  transmission:
    filters.transmission?.length === 1 ? filters.transmission[0] : null,
  vehicleType: filters.vehicleType || null,
  location: filters.city || filters.location || null,
  limit: filters.limit ?? 1000,
  offset: filters.offset ?? 0,
});

export async function getVehicles(filters) {
  try {
    const data = await gqlRequest(VEHICLES_QUERY, {
      filter: buildVehiclesFilterInput(filters ?? {}),
    });
    const items = data?.vehicles?.items ?? [];
    return items.map(mapVehicle);
  } catch {
    return [];
  }
}

// `VehicleObject` carries no publication date and `VehicleSellerObject` no member-since or
// review count, but the schema has them one hop away: `listing.createdAt` and
// `sellerById.{createdAt, reviewsCount}`. They are read on top of the main query and are
// optional — if either call fails the detail page simply does not draw that row.
const LISTING_DATE_QUERY = `query ListingDate($id: String!) { listing(id: $id) { createdAt } }`;
const SELLER_META_QUERY = `query SellerMeta($id: String!) { sellerById(id: $id) { createdAt reviewsCount } }`;

async function readOptional(query, id, pick) {
  try {
    const data = await gqlRequest(query, { id });
    return pick(data) ?? null;
  } catch {
    return null;
  }
}

export async function getVehicleById(id) {
  const safeId = String(id ?? '').trim();
  if (!safeId) return null;
  try {
    const data = await gqlRequest(VEHICLE_BY_ID_QUERY, { id: safeId });
    const row = data?.vehicleById;
    if (!row) return null;
    const vehicle = mapVehicle(row);

    // A seller without a public page (private) keeps their profile details to themselves.
    const sellerId = vehicle.seller?.hasPublicPage ? vehicle.seller.id : null;
    const [listing, sellerMeta] = await Promise.all([
      vehicle.listingId
        ? readOptional(LISTING_DATE_QUERY, vehicle.listingId, (d) => d?.listing)
        : null,
      sellerId ? readOptional(SELLER_META_QUERY, sellerId, (d) => d?.sellerById) : null,
    ]);

    return {
      ...vehicle,
      postedAt: listing?.createdAt ?? null,
      seller: vehicle.seller
        ? {
            ...vehicle.seller,
            memberSince: sellerMeta?.createdAt ?? null,
            votes: sellerMeta?.reviewsCount ?? null,
          }
        : null,
    };
  } catch {
    return null;
  }
}

const PROMOTED_VEHICLES_QUERY = `
query PromotedVehicles($tier: PromotionTier, $limit: Int) {
  promotedVehicles(tier: $tier, limit: $limit) {
    id brand model version year mileage fuel transmission
    engineVolume power drive condition color vehicleType bodyType
    purpose     price currency location imageUrls
    isHot isCreditAvailable isBarterAvailable
    hasDamage isRepainted wasInAccident
    ownersCount seatsCount marketRegion
    seller { id name type hasPublicPage verified rating city phone logo }
    promotionTier viewsCount bumpedAt
  }
}
`;

/**
 * The paid block: VIP for a catalogue, PREMIUM for the home page. The server rotates
 * the pool on the clock, so repeated calls genuinely return different cars.
 */
export async function getPromotedVehicles(tier = 'VIP', limit = 6) {
  try {
    const data = await gqlRequest(PROMOTED_VEHICLES_QUERY, { tier, limit });
    return (data?.promotedVehicles ?? []).map(mapVehicle);
  } catch {
    return [];
  }
}

export const getAutos = () =>
  getVehicles({ limit: VEHICLE_CATALOG_LIMIT, offset: 0 });

export const getAutoById = (id) => getVehicleById(id);
