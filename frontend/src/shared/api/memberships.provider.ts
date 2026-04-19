import type { SpecialistServiceMembership } from '@/memberships/types/membership.types';

export interface MembershipsDataProvider {
  getMembershipsByServiceId: (
    serviceId: string
  ) => Promise<SpecialistServiceMembership[]>;
  getMembershipsBySpecialistId: (
    specialistId: string
  ) => Promise<SpecialistServiceMembership[]>;
}
