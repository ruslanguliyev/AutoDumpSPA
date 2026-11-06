import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { appointmentsApi } from '@/features/appointments/api/appointments.api';

export const useIncomingAppointments = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({ queryKey: ['appointments', 'incoming'], queryFn: appointmentsApi.incoming, enabled: isAuthenticated });
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
