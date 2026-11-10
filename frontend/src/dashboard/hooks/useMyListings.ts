import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { listingsApi } from '@/dashboard/api/listings.api';
import type { ListingKind } from '@/dashboard/api/listings.api';
import { listingMatchesProfile } from '@/dashboard/config/profileScope';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useActiveProfile } from '@/store/useActiveProfileStore';

const KEY = ['my-listings'] as const;

export const useMyListings = (kind?: ListingKind) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeProfile = useActiveProfile();
  const query = useQuery({
    queryKey: [...KEY, activeProfile],
    queryFn: listingsApi.mine,
    enabled: isAuthenticated,
  });
  const items = (query.data ?? []).filter((l) => {
    if (!listingMatchesProfile(l.kind, activeProfile)) return false;
    return kind ? l.kind === kind : true;
  });
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
