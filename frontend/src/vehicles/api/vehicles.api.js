import { gqlRequest } from '@/lib/graphql';
import { resolveMediaUrl } from '@/lib/mediaUrl';

const VEHICLES_QUERY = `
query Vehicles($filter: VehiclesFilterInput) {
  vehicles(filter: $filter) {
    items {
      id brand model version year mileage fuel transmission
      engineVolume power drive condition color vehicleType
      price currency location description imageUrls
      isHot isCreditAvailable isBarterAvailable
      hasDamage isRepainted wasInAccident
      ownersCount seatsCount marketRegion
      seller { id name type hasPublicPage verified rating city phone logo }
    }
    total
  }
}
`;

const VEHICLE_BY_ID_QUERY = `
query VehicleById($id: String!) {
  vehicleById(id: $id) {
    id listingId brand model version year mileage fuel transmission
    engineVolume power drive condition color vehicleType
    price currency location description imageUrls
    isHot isCreditAvailable isBarterAvailable
    hasDamage isRepainted wasInAccident
    ownersCount seatsCount marketRegion
    seller { id name type hasPublicPage verified rating city phone logo }
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
  fuel: row.fuel,
  transmission: row.transmission,
  engineVolume: row.engineVolume,
  power: row.power,
  drive: row.drive ?? null,
  condition: row.condition ?? 'used',
  color: row.color ?? null,
  vehicleType: row.vehicleType ?? 'car',
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
  ownersCount: row.ownersCount ?? 1,
  owners: row.ownersCount ?? 1,
  seatsCount: row.seatsCount ?? null,
  marketRegion: row.marketRegion ?? null,
  seller: row.seller ?? null,
  engine: `${row.engineVolume}L • ${row.power} HP`,
  status: 'available',
  views: 0,
  postedAt: null,
});

const buildVehiclesFilterInput = (filters = {}) => ({
  brand: filters.brand || null,
  model: filters.model || null,
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

export async function getVehicleById(id) {
  const safeId = String(id ?? '').trim();
  if (!safeId) return null;
  try {
    const data = await gqlRequest(VEHICLE_BY_ID_QUERY, { id: safeId });
    const row = data?.vehicleById;
    if (!row) return null;
    return mapVehicle(row);
  } catch {
    return null;
  }
}

export const getAutos = () =>
  getVehicles({ limit: 2000, offset: 0 });

export const getAutoById = (id) => getVehicleById(id);
