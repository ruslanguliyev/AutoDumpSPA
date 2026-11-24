import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useMyListings } from '@/dashboard/hooks/useMyListings';
import { promotionsApi } from '@/features/promotions/api/promotions.api';
import type { PromotionTarget, ViewTarget } from '@/features/promotions/api/promotions.api';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useActiveProfile } from '@/store/useActiveProfileStore';

export const usePromotionQuote = (targetType: PromotionTarget, targetId: string | undefined) =>
  useQuery({
    queryKey: ['promotions', 'quote', targetType, targetId],
    queryFn: () => promotionsApi.quote(targetType, targetId!),
    enabled: Boolean(targetId),
  });

export const useCreatePromotionOrder = () =>
  useMutation({ mutationFn: promotionsApi.createOrder });

/**
 * The order status. While payment is outstanding it polls, because the placement is
 * granted by the provider calling the server, not by the browser coming back.
 */
export const usePromotionOrder = (token: string | undefined) =>
  useQuery({
    queryKey: ['promotions', 'order', token],
    queryFn: () => promotionsApi.order(token!),
    enabled: Boolean(token),
    refetchInterval: (query) =>
      query.state.data?.status === 'PENDING' ? 3000 : false,
  });

export const useMyPromotions = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeProfile = useActiveProfile();
  const listings = useMyListings();
  const query = useQuery({
    queryKey: ['promotions', 'mine', activeProfile],
    queryFn: promotionsApi.mine,
    enabled: isAuthenticated,
  });
  const listingIds = new Set(listings.items.map((l) => l.id));
  const data = (query.data ?? []).filter((promotion) => {
    const { targetType, targetId } = promotion.target;
    if (activeProfile.type === 'service') {
      return targetType === 'SERVICE_CENTER' && targetId === activeProfile.id;
    }
    // Personal (and hidden dealer) share listing promotions; centre promotions stay on service.
    return targetType === 'LISTING' && listingIds.has(targetId);
  });
  return { ...query, data, isLoading: query.isLoading || listings.isLoading };
};

/** Counts one opened page. Fires once per mount; failures are silent on purpose. */
export const useTrackView = (targetType: ViewTarget, targetId: string | undefined) => {
  const tracked = useRef<string | null>(null);
  useEffect(() => {
    if (!targetId || tracked.current === targetId) return;
    tracked.current = targetId;
    void promotionsApi.trackView(targetType, targetId);
  }, [targetType, targetId]);
};

export const useTrackContact = (targetType: PromotionTarget) => (targetId: string | undefined) => {
  if (targetId) void promotionsApi.track('contact', targetType, targetId);
};

export const useAdminPromotions = (activeOnly: boolean) =>
  useQuery({
    queryKey: ['promotions', 'admin', activeOnly],
    queryFn: () => promotionsApi.adminList(activeOnly),
  });

export const useRevokePromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promotionsApi.revoke,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
};

export const useGrantPromotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promotionsApi.grant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });
};
