import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { VEHICLE_CATALOG_LIMIT } from '@/shared/constants/catalogLimits';
import { useFiltersStore } from '@/features/filters/store/useFiltersStore';
import { filterAutosCatalog, getAutos } from '@/vehicles/api/autos';

const CARS_QUERY_KEY = 'cars';

const normalizeString = (value) => String(value ?? '').trim().toLowerCase();

const normalizeNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? '').trim().toLowerCase())
    .filter(Boolean)
    .sort();
};

const normalizeFilters = (filters) => ({
  vehicleType: normalizeString(filters.vehicleType),
  brand: normalizeString(filters.brand),
  model: normalizeString(filters.model),
  price: filters.price || '',
  priceFrom: normalizeNumber(filters.priceFrom),
  priceTo: normalizeNumber(filters.priceTo),
  currency: filters.currency || 'EUR',
  isCredit: Boolean(filters.isCredit),
  isBarter: Boolean(filters.isBarter),
  condition: normalizeString(filters.condition || 'all') || 'all',
  registration: filters.registration || '',
  region: normalizeString(filters.region),
  city: normalizeString(filters.city),
  yearFrom: normalizeNumber(filters.yearFrom),
  yearTo: normalizeNumber(filters.yearTo),
  color: normalizeString(filters.color),
  fuel: normalizeArray(filters.fuel),
  transmission: normalizeArray(filters.transmission),
  engineVolumeFrom: normalizeNumber(filters.engineVolumeFrom),
  engineVolumeTo: normalizeNumber(filters.engineVolumeTo),
  powerFrom: normalizeNumber(filters.powerFrom),
  powerTo: normalizeNumber(filters.powerTo),
  mileageFrom: normalizeNumber(filters.mileageFrom),
  mileageTo: normalizeNumber(filters.mileageTo),
  ownersCount: normalizeNumber(filters.ownersCount),
  seatsCount: normalizeNumber(filters.seatsCount),
  marketRegion: normalizeString(filters.marketRegion),
  hasNoDamage: Boolean(filters.hasNoDamage),
  isUnpainted: Boolean(filters.isUnpainted),
  isAccidentedOnly: Boolean(filters.isAccidentedOnly),
  status: normalizeString(filters.status || 'all') || 'all',
});

export const useAutos = () => {
  const filters = useFiltersStore((state) => state.filters.cars);

  const normalizedFilters = useMemo(
    () => normalizeFilters(filters),
    [filters]
  );

  const catalogQuery = useQuery({
    queryKey: [CARS_QUERY_KEY, 'catalog'],
    queryFn: getAutos,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const autos = useMemo(() => {
    if (!catalogQuery.data) return [];
    return filterAutosCatalog(catalogQuery.data, normalizedFilters);
  }, [catalogQuery.data, normalizedFilters]);

  const catalogComplete =
    !catalogQuery.isLoading && (catalogQuery.data?.length ?? 0) < VEHICLE_CATALOG_LIMIT;

  return {
    autos,
    total: autos.length,
    catalogComplete,
    isLoading: catalogQuery.isLoading || catalogQuery.isFetching,
    error: catalogQuery.error,
  };
};
