import { useQuery } from '@tanstack/react-query';

import { fetchParts } from '@/parts/api/parts.api';
import { getVehicles } from '@/vehicles/api/vehicles.api';

const EMPTY = [];

/**
 * Published vehicles and parts of one seller, loaded from the backend.
 * `enabled` lets callers skip the requests when the data is passed in from outside.
 */
export const useSellerListings = (sellerId, { enabled = true } = {}) => {
  const id = String(sellerId ?? '').trim();
  const active = enabled && Boolean(id);

  const vehiclesQuery = useQuery({
    queryKey: ['seller-vehicles', id],
    queryFn: () => getVehicles({ sellerId: id, limit: 200 }),
    enabled: active,
    staleTime: 30_000,
  });

  const partsQuery = useQuery({
    queryKey: ['seller-parts', id],
    queryFn: () => fetchParts({ sellerId: id, limit: 200 }),
    enabled: active,
    staleTime: 30_000,
  });

  return {
    vehicles: vehiclesQuery.data ?? EMPTY,
    parts: partsQuery.data?.items ?? EMPTY,
    isLoading: active && (vehiclesQuery.isLoading || partsQuery.isLoading),
    error: vehiclesQuery.error ?? partsQuery.error ?? null,
  };
};
