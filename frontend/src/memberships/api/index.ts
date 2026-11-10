import { membershipsMockApi } from '@/memberships/api/memberships.mock';
import { membershipsEnabled } from '@/memberships/config';
import type { MembershipsDataProvider } from '@/shared/api/memberships.provider';
import type { SpecialistServiceMembership } from '@/memberships/types/membership.types';

const emptyApi: MembershipsDataProvider = {
  getMembershipsByServiceId: async () => [] as SpecialistServiceMembership[],
  getMembershipsBySpecialistId: async () => [] as SpecialistServiceMembership[],
};

/** GraphQL lives in `memberships.graphql.ts` for when the backend ships. Until then: mocks only if flagged. */
export const membershipsApi: MembershipsDataProvider = membershipsEnabled()
  ? membershipsMockApi
  : emptyApi;
