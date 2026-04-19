import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/dashboard/api/dashboard.api';
import { useActiveProfile } from '@/store/useActiveProfileStore';

export const DASHBOARD_REVENUE_QUERY_KEY = ['dashboard', 'revenue'] as const;

export function useDashboardRevenue() {
  const activeProfile = useActiveProfile();

  const query = useQuery({
    queryKey: [...DASHBOARD_REVENUE_QUERY_KEY, activeProfile],
    queryFn: () => dashboardApi.getRevenue(activeProfile),
    staleTime: 60_000,
    enabled: activeProfile.type === 'seller' || activeProfile.type === 'service',
  });

  return {
    data: query.data ?? { total: 0, period: 'month', breakdown: [] },
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
