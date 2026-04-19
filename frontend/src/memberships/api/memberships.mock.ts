import { MEMBERSHIPS } from '@/memberships/mock/memberships.mock';
import type { MembershipsDataProvider } from '@/shared/api/memberships.provider';

export const membershipsMockApi: MembershipsDataProvider = {
  getMembershipsByServiceId: async (serviceId: string) => {
    const safeId = String(serviceId ?? '').trim();
    if (!safeId) return [];
    return MEMBERSHIPS.filter(
      (membership) => membership.serviceId === safeId
    );
  },
  getMembershipsBySpecialistId: async (specialistId: string) => {
    const safeId = String(specialistId ?? '').trim();
    if (!safeId) return [];
    return MEMBERSHIPS.filter(
      (membership) => membership.specialistId === safeId
    );
  },
};
