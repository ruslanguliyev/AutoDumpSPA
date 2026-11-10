import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { appointmentsApi } from '@/features/appointments/api/appointments.api';
import { useActiveProfile } from '@/store/useActiveProfileStore';

export const useIncomingAppointments = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeProfile = useActiveProfile();
  const query = useQuery({
    queryKey: ['appointments', 'incoming', activeProfile],
    queryFn: appointmentsApi.incoming,
    enabled: isAuthenticated,
  });
  const data =
    activeProfile.type === 'service'
      ? (query.data ?? []).filter(
          (a) => a.targetType === 'SERVICE_CENTER' && a.targetId === activeProfile.id,
        )
      : query.data;
  return { ...query, data };
};

export const useMyAppointments = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({ queryKey: ['appointments', 'mine'], queryFn: appointmentsApi.mine, enabled: isAuthenticated });
};

export const usePendingAppointmentsCount = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['appointments', 'pending-count'],
    queryFn: appointmentsApi.pendingCount,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
};

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['appointments'] });
};

export const useRequestAppointment = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: appointmentsApi.request, onSuccess: invalidate });
};

export const useDecideAppointment = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, confirm }: { id: string; confirm: boolean }) => appointmentsApi.decide(id, confirm),
    onSuccess: invalidate,
  });
};

export const useCancelAppointment = () => {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: appointmentsApi.cancel, onSuccess: invalidate });
};
