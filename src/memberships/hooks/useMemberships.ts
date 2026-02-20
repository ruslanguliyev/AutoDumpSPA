import { useQuery } from '@tanstack/react-query';
import { membershipsApi } from '@/memberships/api';
import type { SpecialistServiceMembership } from '@/memberships/types/membership.types';

const MEMBERSHIPS_QUERY_KEY = 'memberships';

export const useMembershipsByServiceId = (serviceId?: string) => {
  const safeId = String(serviceId ?? '').trim();
  const query = useQuery({
    queryKey: [MEMBERSHIPS_QUERY_KEY, { serviceId: safeId }],
    queryFn: () => membershipsApi.getMembershipsByServiceId(safeId),
    enabled: Boolean(safeId),
    staleTime: 30_000,
  });

  return {
    memberships: (query.data ?? []) as SpecialistServiceMembership[],
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useMembershipsBySpecialistId = (specialistId?: string) => {
  const safeId = String(specialistId ?? '').trim();
  const query = useQuery({
    queryKey: [MEMBERSHIPS_QUERY_KEY, { specialistId: safeId }],
    queryFn: () => membershipsApi.getMembershipsBySpecialistId(safeId),
    enabled: Boolean(safeId),
    staleTime: 30_000,
  });

  return {
    memberships: (query.data ?? []) as SpecialistServiceMembership[],
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
