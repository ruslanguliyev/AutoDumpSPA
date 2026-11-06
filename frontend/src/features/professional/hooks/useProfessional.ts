import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { professionalApi } from '@/features/professional/api/professional.api';

/** The signed-in user's own specialist profile and/or service center (null when they have none). */
export const useMyProfessional = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const specialist = useQuery({
    queryKey: ['professional', 'specialist'],
    queryFn: professionalApi.mySpecialist,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  const serviceCenter = useQuery({
    queryKey: ['professional', 'service-center'],
    queryFn: professionalApi.myServiceCenter,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
  return {
    specialist: specialist.data ?? null,
    serviceCenter: serviceCenter.data ?? null,
    isLoading: specialist.isLoading || serviceCenter.isLoading,
  };
};

/** Public pages list profiles from several queries, so refresh everything after a change. */
const useRefresh = () => {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries();
};

export const useSaveSpecialist = (exists: boolean) => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (v: Parameters<typeof professionalApi.createSpecialist>[0]) =>
      exists ? professionalApi.updateSpecialist(v) : professionalApi.createSpecialist(v),
    onSuccess: refresh,
  });
};

export const useSaveServiceCenter = (exists: boolean) => {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (v: Parameters<typeof professionalApi.createServiceCenter>[0]) =>
      exists ? professionalApi.updateServiceCenter(v) : professionalApi.createServiceCenter(v),
    onSuccess: refresh,
  });
};
