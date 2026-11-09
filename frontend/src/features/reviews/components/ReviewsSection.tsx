import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { Review, ReviewTargetType } from '@/features/reviews/api/reviews.api';
import { useMyProfessional } from '@/features/professional/hooks/useProfessional';
import { useDeleteReview, useReviews, useSubmitReview } from '@/features/reviews/hooks/useReviews';
import { ReviewsBlock, ReviewsWriteForm } from '@/shared/blocks/ReviewsBlock';
import { appLoginUrl } from '@/shared/constants/appUrls';

const PAGE = 5;

function ReviewForm({
  targetType,
  targetId,
  existing,
  onDone,
}: {
  targetType: ReviewTargetType;
  targetId: string;
  existing?: Review;
  onDone?: () => void;
}) {
  const { t } = useTranslation('common');
  const submit = useSubmitReview();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');

  const onSubmit = () => {
    if (rating < 1) return;
    submit.mutate(
      { targetType, targetId, rating, comment: comment.trim() || undefined },
      { onSuccess: onDone },
    );
  };

  return (
    <ReviewsWriteForm
      rating={rating}
      onRatingChange={setRating}
      comment={comment}
      onCommentChange={setComment}
      onSubmit={onSubmit}
      pending={submit.isPending}
      error={submit.isError ? submit.error.message : null}
      submitLabel={existing ? t('reviews.update') : t('reviews.submit')}
      heading={t('reviews.write')}
      ratingLabel={t('reviews.yourRating')}
      commentPlaceholder={t('reviews.commentPlaceholder')}
    />
  );
}

/**
 * Data wrapper around `ReviewsBlock` for seller, specialist and service centre targets.
 */
export function ReviewsSection({
  targetType,
  targetId,
  canReview = true,
  className = '',
}: {
  targetType: ReviewTargetType;
  targetId?: string;
  canReview?: boolean;
  className?: string;
}) {
  const { t, i18n } = useTranslation('common');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [limit, setLimit] = useState(PAGE);
  const [editing, setEditing] = useState(false);
  const { data } = useReviews(targetType, targetId, limit);
  const remove = useDeleteReview();
  const own = useMyProfessional();

  if (!targetId) return null;

  const isOwnProfile =
    (targetType === 'SPECIALIST' && own.specialist?.id === targetId) ||
    (targetType === 'SERVICE_CENTER' && own.serviceCenter?.id === targetId);

  const total = data?.total ?? 0;
  const mine = data?.items.find((r) => r.mine);
  const showWrite =
    canReview && !isOwnProfile && !(isAuthenticated && mine && !editing);

  const blockData =
    total > 0 && data
      ? {
          average: data.average,
          total: data.total,
          distribution: data.distribution,
          items: data.items,
        }
      : null;

  const formatDate = (value: string) => new Date(value).toLocaleDateString(i18n.language);

  let writeForm = null;
  if (showWrite) {
    if (!isAuthenticated) {
      writeForm = null;
    } else if (editing || !mine) {
      writeForm = (
        <ReviewForm
          targetType={targetType}
          targetId={targetId}
          existing={mine}
          onDone={() => setEditing(false)}
        />
      );
    }
  }

  return (
    <ReviewsBlock
      className={className}
      data={blockData}
      showMoreRemaining={data && total > data.items.length ? total - data.items.length : 0}
      onShowMore={data && total > data.items.length ? () => setLimit((l) => l + PAGE) : undefined}
      showWriteSection={showWrite}
      writeForm={writeForm}
      loginHref={showWrite && !isAuthenticated ? appLoginUrl(window.location.pathname) : undefined}
      formatDate={formatDate}
      renderReviewActions={(review) =>
        review.mine ? (
          <div className="mt-3 flex gap-3 text-[13px] font-semibold">
            <button type="button" className="text-primary-text hover:underline" onClick={() => setEditing(true)}>
              {t('reviews.edit')}
            </button>
            <button
              type="button"
              className="text-destructive hover:underline disabled:opacity-60"
              disabled={remove.isPending}
              onClick={() => remove.mutate(review.id)}
            >
              {t('reviews.delete')}
            </button>
          </div>
        ) : null
      }
    />
  );
}

export default ReviewsSection;
