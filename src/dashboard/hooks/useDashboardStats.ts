import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/dashboard/api/dashboard.api';
import { useActiveProfile } from '@/store/useActiveProfileStore';
import type { ActiveProfile } from '@/dashboard/types/dashboard.types';

export const DASHBOARD_STATS_QUERY_KEY = ['dashboard', 'stats'] as const;

export function useDashboardStats() {
  const activeProfile = useActiveProfile();

  const query = useQuery({
    queryKey: [...DASHBOARD_STATS_QUERY_KEY, activeProfile],
    queryFn: () => dashboardApi.getStats(activeProfile),
    staleTime: 30_000,
  });

  return {
    stats: query.data?.stats ?? [],
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
