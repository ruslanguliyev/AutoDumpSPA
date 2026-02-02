import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchParts } from '@/parts/api/parts.api';
import { sanitizeFilters } from '@/parts/utils/filterParts';
import { useFiltersStore } from '@/features/filters/store/useFiltersStore';
import { usePartsStore } from '@/parts/store/partsStore';
import { PARTS_DEFAULT_FILTER } from '@/parts/utils/parts.constants';

const PARTS_QUERY_KEY = 'parts';

export const useParts = () => {
  const queryClient = useQueryClient();
  const filters = useFiltersStore((state) => state.filters.parts);
  const selectedPartId = usePartsStore((state) => state.selectedPartId);
  const selectPart = usePartsStore((state) => state.selectPart);

  const normalizedFilters = useMemo(
    () => sanitizeFilters(filters),
    [filters]
  );

  // Unfiltered dataset: used for select options (brands/models/locations).
  // Keep independent from current filters so options don't collapse.
  const unfilteredFilters = useMemo(
    () =>
      sanitizeFilters({
        ...PARTS_DEFAULT_FILTER,
        // ensure we fetch the full dataset for option derivation
        limit: 10_000,
        offset: 0,
      }),
    []
  );

  const allPartsQuery = useQuery({
    queryKey: [PARTS_QUERY_KEY, 'all', unfilteredFilters],
    queryFn: () => fetchParts(unfilteredFilters),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  const query = useQuery({
    queryKey: [PARTS_QUERY_KEY, normalizedFilters],
    queryFn: () => fetchParts(normalizedFilters),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  // Select options must be derived from FULL dataset only (allParts),
  // never from filtered results (query.data.items).
  const optionsSource = useMemo(
    () => allPartsQuery.data?.items ?? [],
    [allPartsQuery.data?.items]
  );

  const selectOptions = useMemo(() => {
    const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort();
    const toOptions = (values) =>
      uniqueSorted(values).map((value) => ({ value, label: value }));

    const ensureSelected = (options, selectedValue) => {
      if (!selectedValue) return options;
      if (options.some((option) => option.value === selectedValue)) return options;
      // Keep current selection visible even if it's not in the dataset yet.
      return [{ value: selectedValue, label: selectedValue }, ...options];
    };

    const brands = ensureSelected(
      toOptions(optionsSource.map((part) => part.brand)),
      filters.brand
    );

    const models = filters.brand
      ? toOptions(
          optionsSource
            .filter((part) => part.brand === filters.brand)
            .map((part) => part.model)
        )
      : [];

    const locations = ensureSelected(
      toOptions(optionsSource.map((part) => part.location)),
      filters.location
    );

    return { brands, models, locations };
  }, [filters.brand, filters.location, optionsSource]);

  // 🔑 КЛЮЧЕВАЯ ЛОГИКА
  const hasData = Boolean(query.data?.items?.length);

  return {
    allParts: allPartsQuery.data?.items ?? [],
    parts: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading || query.isFetching,

    // ❗ Ошибка ТОЛЬКО если НЕТ данных
    error: hasData ? null : query.error,

    // UI consumes filters from the unified filters store.
    filters,
    refetch: query.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: [PARTS_QUERY_KEY] }),

    selectOptions,
    selectedPartId,
    selectPart,
  };
};
