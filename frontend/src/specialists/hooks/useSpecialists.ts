import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { specialistsApi } from '@/specialists/api';
import { useFilters } from '@/features/filters/store/useFiltersStore';
import type { SpecialistsFiltersInput } from '@/specialists/api/specialists.types';
import type { SpecialistDetail, SpecialistProfile } from '@/specialists/types/specialist.types';
import type { DomainFilters } from '@/features/filters/types/filters.types';

const SPECIALISTS_QUERY_KEY = 'specialists';
const SPECIALIST_QUERY_KEY = 'specialist';
const SPECIALISTS_BY_IDS_QUERY_KEY = 'specialists-by-ids';

const toNumberOrNull = (value: unknown): number | null => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const normalizeText = (value: unknown) => toString(value).toLowerCase();

const normalizeFilters = (filters: DomainFilters): SpecialistsFiltersInput => ({
  brand: toString(filters.brand) || null,
  model: null,
  year: null,
  specialization: (toString(filters.specialization) || null) as SpecialistsFiltersInput['specialization'],
  city: toString(filters.city) || null,
  minRating: toNumberOrNull(filters.minRating),
});

const applyListFilters = (
  list: SpecialistProfile[],
  filters: DomainFilters,
  vehiclesFilterSupported: boolean
): SpecialistProfile[] => {
  let result = list;
  const brand = normalizeText(filters.brand);
  if (vehiclesFilterSupported && brand) {
    result = result.filter((specialist) =>
      specialist.supportedVehicles?.some((vehicle) =>
        normalizeText(vehicle.brand).includes(brand)
      )
    );
  }
  if (filters.availableNow) {
    result = result.filter((specialist) => specialist.available === true);
  }
  return result;
};

const createStableQueryKey = (filters: SpecialistsFiltersInput) => {
  const entries = Object.entries(filters)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  return entries.length > 0 ? Object.fromEntries(entries) : null;
};

export const useSpecialistsQuery = (
  filters: SpecialistsFiltersInput,
  options: { enabled?: boolean } = {}
) => {
  const stableKey = useMemo(() => createStableQueryKey(filters), [filters]);

  const query = useQuery({
    queryKey: [SPECIALISTS_QUERY_KEY, stableKey],
    queryFn: () => specialistsApi.getSpecialists(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    ...options,
  });

  const base = (query.data ?? []) as SpecialistProfile[];

  return {
    specialists: base,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};

type UseSpecialistsOptions = {
  vehiclesFilterSupported?: boolean;
};

export const useSpecialists = (options: UseSpecialistsOptions = {}) => {
  const { vehiclesFilterSupported = false } = options;
  const filters = useFilters('specialists');
  const normalizedFilters = useMemo(() => normalizeFilters(filters), [filters]);
  const query = useSpecialistsQuery(normalizedFilters);

  const specialists = useMemo(
    () => applyListFilters(query.specialists, filters, vehiclesFilterSupported),
    [query.specialists, filters, vehiclesFilterSupported]
  );

  return {
    ...query,
    specialists,
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
    queryKey: [SPECIALISTS_BY_IDS_QUERY_KEY, normalizedIds],
    queryFn: () => specialistsApi.getSpecialistsByIds(normalizedIds),
    enabled: normalizedIds.length > 0 && (options.enabled ?? true),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  return {
    specialists: (query.data ?? []) as SpecialistProfile[],
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
