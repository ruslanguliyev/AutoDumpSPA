import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { specialistsApi } from '@/specialists/api';
import { useSpecialistFiltersStore } from '@/specialists/store/useSpecialistFiltersStore';
import type { SpecialistsFiltersInput } from '@/specialists/api/specialists.types';
import type { SpecialistDetail, SpecialistProfile } from '@/specialists/types/specialist.types';

const SPECIALISTS_QUERY_KEY = 'specialists';
const SPECIALIST_QUERY_KEY = 'specialist';
const SPECIALISTS_BY_IDS_QUERY_KEY = 'specialists';

const toNumberOrNull = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeFilters = (
  filters: ReturnType<typeof useSpecialistFiltersStore.getState>['filters']
): SpecialistsFiltersInput => ({
  brand: filters.brand.trim() || null,
  model: filters.model.trim() || null,
  year: filters.year ? toNumberOrNull(filters.year) : null,
  specialization: filters.specialization || null,
  city: filters.city.trim() || null,
  minRating: filters.minRating ? toNumberOrNull(filters.minRating) : null,
});

export const useSpecialistsQuery = (
  filters: SpecialistsFiltersInput,
  options: { enabled?: boolean } = {}
) => {
  const query = useQuery({
    queryKey: [SPECIALISTS_QUERY_KEY, filters],
    queryFn: () => specialistsApi.getSpecialists(filters),
    staleTime: 30_000,
    keepPreviousData: true,
    ...options,
  });

  return {
    specialists: (query.data ?? []) as SpecialistProfile[],
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useSpecialists = () => {
  const filters = useSpecialistFiltersStore((state) => state.filters);
  const normalizedFilters = useMemo(() => normalizeFilters(filters), [filters]);
  const query = useSpecialistsQuery(normalizedFilters);

  return {
    ...query,
    filters,
  };
};

export const useSpecialistBySlug = (slug?: string) => {
  const query = useQuery({
    queryKey: [SPECIALIST_QUERY_KEY, slug],
    queryFn: () => (slug ? specialistsApi.getSpecialistBySlug(slug) : null),
    enabled: Boolean(slug),
    staleTime: 30_000,
  });

  return {
    specialist: (query.data ?? null) as SpecialistDetail | null,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useSpecialistsByIds = (
  ids: string[],
  options: { enabled?: boolean } = {}
) => {
  const normalizedIds = useMemo(
    () =>
      Array.from(
        new Set((ids ?? []).map((id) => String(id).trim()).filter(Boolean))
      ).sort(),
    [ids]
  );

  const query = useQuery({
    queryKey: [SPECIALISTS_BY_IDS_QUERY_KEY, { ids: normalizedIds }],
    queryFn: () => specialistsApi.getSpecialistsByIds(normalizedIds),
    enabled: normalizedIds.length > 0 && (options.enabled ?? true),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  return {
    specialists: (query.data ?? []) as SpecialistProfile[],
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
