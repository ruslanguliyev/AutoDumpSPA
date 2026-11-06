import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { rentalsApi } from '@/features/rentals/api/rentals.api';

export const useIncomingRentals = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({ queryKey: ['rentals', 'incoming'], queryFn: rentalsApi.incoming, enabled: isAuthenticated });
};

export const useMyRentals = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({ queryKey: ['rentals', 'mine'], queryFn: rentalsApi.mine, enabled: isAuthenticated });
};

export const usePendingRentalRequestsCount = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['rentals', 'pending-count'],
    queryFn: rentalsApi.pendingCount,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
};

/** Days of a rental car that cannot be booked (confirmed bookings and owner-blocked days). */
export const useRentalAvailability = (listingId?: string | null) =>
  useQuery({
    queryKey: ['rentals', 'availability', listingId],
    queryFn: () => rentalsApi.availability(listingId!),
    enabled: Boolean(listingId),
    staleTime: 30_000,
  });

const useInvalidateRentals = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['rentals'] });
};

export const useRequestRental = () => {
  const invalidate = useInvalidateRentals();
  return useMutation({ mutationFn: rentalsApi.request, onSuccess: invalidate });
};

export const useDecideRental = () => {
  const invalidate = useInvalidateRentals();
  return useMutation({
    mutationFn: ({ id, confirm }: { id: string; confirm: boolean }) => rentalsApi.decide(id, confirm),
    onSuccess: invalidate,
  });
};

export const useCancelRental = () => {
  const invalidate = useInvalidateRentals();
  return useMutation({ mutationFn: rentalsApi.cancel, onSuccess: invalidate });
};

export const useRentalBlocks = (listingId?: string | null) =>
  useQuery({
    queryKey: ['rentals', 'blocks', listingId],
    queryFn: () => rentalsApi.blocks(listingId!),
    enabled: Boolean(listingId),
  });

export const useAddRentalBlock = () => {
  const invalidate = useInvalidateRentals();
  return useMutation({
    mutationFn: (v: { listingId: string; startDate: string; endDate: string; note?: string }) =>
      rentalsApi.addBlock(v.listingId, v.startDate, v.endDate, v.note),
    onSuccess: invalidate,
  });
};

export const useRemoveRentalBlock = () => {
  const invalidate = useInvalidateRentals();
  return useMutation({ mutationFn: rentalsApi.removeBlock, onSuccess: invalidate });
};
