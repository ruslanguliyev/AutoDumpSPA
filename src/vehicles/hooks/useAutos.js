import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useFiltersStore } from '@/features/filters/store/useFiltersStore';
import { getAutosByFilters } from '@/vehicles/api/autos';

const AUTOS_QUERY_KEY = 'autos';

const normalizeFilters = (filters) => ({
  vehicleType: filters.vehicleType,
  brand: filters.brand?.trim() || '',
  model: filters.model?.trim() || '',
  price: filters.price || '',
  registration: filters.registration || '',
  region: filters.region || '',
  city: filters.city?.trim() || '',
});

export const useAutos = () => {
  const filters = useFiltersStore((state) => state.filters.cars);

  const normalizedFilters = useMemo(
    () => normalizeFilters(filters),
    [filters]
  );

  const query = useQuery({
    queryKey: [AUTOS_QUERY_KEY, normalizedFilters],
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
