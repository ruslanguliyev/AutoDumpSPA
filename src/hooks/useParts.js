import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchParts } from '@/api/parts/parts.api';
import { sanitizeFilters } from '@/domain/parts/filterParts';
import { usePartsStore } from '@/store/partsStore';

const PARTS_QUERY_KEY = 'parts';

export const useParts = () => {
  const queryClient = useQueryClient();
  const { filters, setFilter, resetFilters, selectedPartId, selectPart } =
    usePartsStore();

  const normalizedFilters = useMemo(
    () => sanitizeFilters(filters),
    [filters]
  );

  const query = useQuery({
    queryKey: [PARTS_QUERY_KEY, normalizedFilters],
    queryFn: () => fetchParts(normalizedFilters),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [PARTS_QUERY_KEY] });

  return {
    parts: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    filters: normalizedFilters,
    setFilter,
    resetFilters,
    refetch: query.refetch,
    invalidate,
    selectedPartId,
    selectPart,
  };
};

