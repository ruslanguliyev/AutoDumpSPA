import { specialistsGraphqlApi } from '@/specialists/api/specialists.graphql';
import { specialistsMockApi } from '@/specialists/api/specialists.mock';
import type { SpecialistsDataProvider } from '@/shared/api/specialists.provider';

const shouldUseMocks = (): boolean => {
  const envFlag = import.meta.env.VITE_USE_SPECIALISTS_MOCKS;
  if (envFlag !== undefined) {
    return String(envFlag) !== 'false';
  }
  return import.meta.env.DEV;
};

export const specialistsApi: SpecialistsDataProvider = shouldUseMocks()
  ? specialistsMockApi
  : specialistsGraphqlApi;
