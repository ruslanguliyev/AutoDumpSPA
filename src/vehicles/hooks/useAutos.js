import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useFiltersStore } from '@/features/filters/store/useFiltersStore';
import { getAutosByFilters } from '@/vehicles/api/autos';

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

  const query = useQuery({
    queryKey: [CARS_QUERY_KEY, normalizedFilters],
    queryFn: () => getAutosByFilters(normalizedFilters),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const autos = query.data ?? [];

  return {
    autos,
    total: autos.length,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
  };
};
