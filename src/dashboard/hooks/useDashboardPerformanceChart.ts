import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/dashboard/api/dashboard.api';
import { useActiveProfile } from '@/store/useActiveProfileStore';

export const DASHBOARD_CHART_QUERY_KEY = ['dashboard', 'performance'] as const;

export function useDashboardPerformanceChart() {
  const activeProfile = useActiveProfile();

  const query = useQuery({
    queryKey: [...DASHBOARD_CHART_QUERY_KEY, activeProfile],
    queryFn: () => dashboardApi.getPerformanceChart(activeProfile),
    staleTime: 60_000,
  });

  return {
    series: query.data?.series ?? [],
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
