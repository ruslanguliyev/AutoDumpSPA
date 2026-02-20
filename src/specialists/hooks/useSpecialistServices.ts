import { useMemo } from 'react';
import { useMembershipsBySpecialistId } from '@/memberships/hooks/useMemberships';
import { useServicesByIds } from '@/services/hooks/useServicesByIds';
import type { ServiceProfile } from '@/services/types/service.types';
import type { SpecialistServiceMembership } from '@/memberships/types/membership.types';

const getPrimaryMembership = (memberships: SpecialistServiceMembership[]) => {
  if (!memberships.length) return null;
  return memberships.find((membership) => membership.isPrimary) ?? memberships[0];
};

export const useSpecialistServices = (specialistId?: string) => {
  const {
    memberships,
    isLoading: membershipsLoading,
    error: membershipsError,
  } = useMembershipsBySpecialistId(specialistId);

  const serviceIds = useMemo(
    () => memberships.map((membership) => membership.serviceId),
    [memberships]
  );

  const {
    services,
    isLoading: servicesLoading,
    error: servicesError,
  } = useServicesByIds(serviceIds, { enabled: serviceIds.length > 0 });

  const primaryMembership = useMemo(
    () => getPrimaryMembership(memberships),
    [memberships]
  );

  const primaryService = useMemo(() => {
    if (!primaryMembership) return null;
    return (
      services.find((service) => String(service.id) === String(primaryMembership.serviceId)) ??
      null
    );
  }, [primaryMembership, services]);

  return {
    memberships,
    services: services as ServiceProfile[],
    primaryService: primaryService as ServiceProfile | null,
    isLoading: membershipsLoading || servicesLoading,
    error: membershipsError || servicesError,
  };
};
