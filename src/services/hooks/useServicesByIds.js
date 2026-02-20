import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getServicesByIds } from '@/services/api/services.query';

const SERVICES_BY_IDS_QUERY_KEY = 'services';

export const useServicesByIds = (ids = [], options = {}) => {
  const normalizedIds = useMemo(
    () =>
      Array.from(new Set((ids ?? []).map((id) => String(id).trim()).filter(Boolean))).sort(),
    [ids]
  );

  const query = useQuery({
    queryKey: [SERVICES_BY_IDS_QUERY_KEY, { ids: normalizedIds }],
    queryFn: () => getServicesByIds(normalizedIds),
    enabled: normalizedIds.length > 0 && (options.enabled ?? true),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  return {
    services: query.data ?? [],
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
