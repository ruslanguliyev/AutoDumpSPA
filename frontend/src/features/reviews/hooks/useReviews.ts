import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { reviewsApi } from '@/features/reviews/api/reviews.api';
import type { ReviewTargetType } from '@/features/reviews/api/reviews.api';

export const useReviews = (targetType: ReviewTargetType, targetId: string | undefined, limit: number) => {
  // The token decides which review is flagged as "mine", so it is part of the cache key.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['reviews', targetType, targetId, limit, isAuthenticated],
    queryFn: () => reviewsApi.list(targetType, targetId!, limit),
    enabled: Boolean(targetId),
    placeholderData: keepPreviousData,
  });
};

/** Profile queries carry the cached rating and count, so refresh everything after a change (rare action). */
const useRefreshAfterChange = () => {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries();
};

export const useSubmitReview = () => {
  const refresh = useRefreshAfterChange();
  return useMutation({ mutationFn: reviewsApi.submit, onSuccess: refresh });
};

export const useDeleteReview = () => {
  const refresh = useRefreshAfterChange();
  return useMutation({ mutationFn: reviewsApi.remove, onSuccess: refresh });
};
