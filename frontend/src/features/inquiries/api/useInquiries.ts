import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useMyListings } from '@/dashboard/hooks/useMyListings';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { inquiriesApi } from '@/features/inquiries/api/inquiries.api';
import { useActiveProfile } from '@/store/useActiveProfileStore';

export const useReceivedInquiries = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeProfile = useActiveProfile();
  const listings = useMyListings();
  const query = useQuery({
    queryKey: ['inquiries', 'received', activeProfile],
    queryFn: inquiriesApi.received,
    enabled: isAuthenticated,
  });
  const listingIds = new Set(listings.items.map((l) => l.id));
  const data = (query.data ?? []).filter((inquiry) => listingIds.has(inquiry.listingId));
  return { ...query, data, isLoading: query.isLoading || listings.isLoading };
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
