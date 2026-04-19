import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/dashboard/api/dashboard.api';
import { useActiveProfile } from '@/store/useActiveProfileStore';

export const DASHBOARD_BOOKINGS_QUERY_KEY = ['dashboard', 'bookings'] as const;

export function useDashboardServiceBookings() {
  const activeProfile = useActiveProfile();

  const query = useQuery({
    queryKey: [...DASHBOARD_BOOKINGS_QUERY_KEY, activeProfile],
    queryFn: () => dashboardApi.getServiceBookings(activeProfile),
    staleTime: 60_000,
    enabled: activeProfile.type === 'service',
  });

  return {
    data: query.data ?? { upcoming: 0, completed: 0, cancelled: 0 },
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
