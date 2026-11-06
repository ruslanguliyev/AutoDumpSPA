import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { promotionsApi } from '@/features/promotions/api/promotions.api';
import type { PromotionTarget } from '@/features/promotions/api/promotions.api';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

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
  return useQuery({
    queryKey: ['promotions', 'mine'],
    queryFn: promotionsApi.mine,
    enabled: isAuthenticated,
  });
};

/** Counts one opened page. Fires once per mount; failures are silent on purpose. */
export const useTrackView = (targetType: PromotionTarget, targetId: string | undefined) => {
  const tracked = useRef<string | null>(null);
  useEffect(() => {
    if (!targetId || tracked.current === targetId) return;
    tracked.current = targetId;
    void promotionsApi.track('view', targetType, targetId);
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
