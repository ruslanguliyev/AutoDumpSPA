import { membershipsGraphqlApi } from '@/memberships/api/memberships.graphql';
import { membershipsMockApi } from '@/memberships/api/memberships.mock';
import type { MembershipsDataProvider } from '@/shared/api/memberships.provider';

const shouldUseMocks = (): boolean => {
  const envFlag = import.meta.env.VITE_USE_MEMBERSHIPS_MOCKS;
  if (envFlag !== undefined) {
    return String(envFlag) !== 'false';
  }
  // The backend has no memberships resolver yet, so mocks stay the default
  // (in every environment) until it is implemented.
  return true;
};

export const membershipsApi: MembershipsDataProvider = shouldUseMocks()
  ? membershipsMockApi
  : membershipsGraphqlApi;
