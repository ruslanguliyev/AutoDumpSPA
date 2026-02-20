import { useMemo } from 'react';
import { useMembershipsByServiceId } from '@/memberships/hooks/useMemberships';
import { useSpecialistsByIds } from '@/specialists/hooks/useSpecialists';

export const useServiceSpecialists = (serviceId) => {
  const {
    memberships,
    isLoading: membershipsLoading,
    error: membershipsError,
  } = useMembershipsByServiceId(serviceId);

  const specialistIds = useMemo(
    () => memberships.map((membership) => membership.specialistId),
    [memberships]
  );

  const {
    specialists,
    isLoading: specialistsLoading,
    error: specialistsError,
  } = useSpecialistsByIds(specialistIds, { enabled: specialistIds.length > 0 });

  return {
    memberships,
    specialists,
    isLoading: membershipsLoading || specialistsLoading,
    error: membershipsError || specialistsError,
  };
};
