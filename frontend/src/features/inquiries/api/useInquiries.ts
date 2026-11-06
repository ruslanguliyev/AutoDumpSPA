import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { inquiriesApi } from '@/features/inquiries/api/inquiries.api';

export const useReceivedInquiries = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['inquiries', 'received'],
    queryFn: inquiriesApi.received,
    enabled: isAuthenticated,
  });
};

export const useSentInquiries = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['inquiries', 'sent'],
    queryFn: inquiriesApi.sent,
    enabled: isAuthenticated,
  });
};

export const useUnreadInquiriesCount = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['inquiries', 'unread'],
    queryFn: inquiriesApi.unreadCount,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
};

export const useMarkInquiryRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inquiriesApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useCreateInquiry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inquiriesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inquiries', 'sent'] }),
  });
};
