import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { listingsApi } from '@/dashboard/api/listings.api';
import type { ListingKind } from '@/dashboard/api/listings.api';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const KEY = ['my-listings'] as const;

export const useMyListings = (kind?: ListingKind) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const query = useQuery({
    queryKey: KEY,
    queryFn: listingsApi.mine,
    enabled: isAuthenticated,
  });
  const items = kind ? (query.data ?? []).filter((l) => l.kind === kind) : (query.data ?? []);
  return { ...query, items };
};

export const useListingActions = () => {
  const qc = useQueryClient();
  const onSuccess = () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
  return {
    publish: useMutation({ mutationFn: listingsApi.publish, onSuccess }),
    unpublish: useMutation({ mutationFn: listingsApi.unpublish, onSuccess }),
    close: useMutation({ mutationFn: listingsApi.close, onSuccess }),
    remove: useMutation({ mutationFn: listingsApi.remove, onSuccess }),
  };
};
