import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/dashboard/api/dashboard.api';
import { useActiveProfile } from '@/store/useActiveProfileStore';

export const DASHBOARD_ACTIVITY_QUERY_KEY = ['dashboard', 'activity'] as const;

export function useDashboardActivity() {
  const activeProfile = useActiveProfile();

  const query = useQuery({
    queryKey: [...DASHBOARD_ACTIVITY_QUERY_KEY, activeProfile],
    queryFn: () => dashboardApi.getActivity(activeProfile),
    staleTime: 30_000,
  });

  return {
    items: query.data?.items ?? [],
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
