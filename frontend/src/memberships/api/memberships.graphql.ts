import { graphqlRequest } from '@/lib/graphql';
import type { MembershipsDataProvider } from '@/shared/api/memberships.provider';
import type { SpecialistServiceMembership } from '@/memberships/types/membership.types';

const MEMBERSHIPS_BY_SERVICE_QUERY = `
query GetMembershipsByServiceId($serviceId: ID!) {
  getMembershipsByServiceId(serviceId: $serviceId) {
    id
    specialistId
    serviceId
    role
    isPrimary
  }
}
`;

const MEMBERSHIPS_BY_SPECIALIST_QUERY = `
query GetMembershipsBySpecialistId($specialistId: ID!) {
  getMembershipsBySpecialistId(specialistId: $specialistId) {
    id
    specialistId
    serviceId
    role
    isPrimary
  }
}
`;

type MembershipsByServiceResponse = {
  getMembershipsByServiceId: SpecialistServiceMembership[];
};

type MembershipsBySpecialistResponse = {
  getMembershipsBySpecialistId: SpecialistServiceMembership[];
};

export const membershipsGraphqlApi: MembershipsDataProvider = {
  getMembershipsByServiceId: async (serviceId: string) => {
    const safeId = String(serviceId ?? '').trim();
    if (!safeId) return [];

    const data = await graphqlRequest<MembershipsByServiceResponse>({
      query: MEMBERSHIPS_BY_SERVICE_QUERY,
      variables: { serviceId: safeId },
    });

    return data?.getMembershipsByServiceId ?? [];
  },
  getMembershipsBySpecialistId: async (specialistId: string) => {
    const safeId = String(specialistId ?? '').trim();
    if (!safeId) return [];

    const data = await graphqlRequest<MembershipsBySpecialistResponse>({
      query: MEMBERSHIPS_BY_SPECIALIST_QUERY,
      variables: { specialistId: safeId },
    });

    return data?.getMembershipsBySpecialistId ?? [];
  },
};
