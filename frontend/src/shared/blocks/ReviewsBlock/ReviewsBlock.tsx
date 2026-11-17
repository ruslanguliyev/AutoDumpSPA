import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

import RatingStars from '@/shared/ui/RatingStars/RatingStars';
import Button from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { controlClass } from '@/shared/ui/controlClass';
import { FieldLabel } from '@/shared/ui/field';
import { formatReviewAuthorName } from './formatReviewAuthor';
import { ReviewStarPicker } from './ReviewStarPicker';

export type ReviewsBlockItem = {
  id: string;
  authorName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  mine?: boolean;
};

export type ReviewsBlockData = {
  average: number;
  total: number;
  /** Index 0 = 1-star count … index 4 = 5-star count. */
  distribution: number[];
  items: ReviewsBlockItem[];
};

type ReviewsBlockProps = {
  /** When null or `total === 0`, only the empty state is shown (no invented averages). */
  data: ReviewsBlockData | null | undefined;
  className?: string;
  showMoreRemaining?: number;
  onShowMore?: () => void;
  showWriteSection?: boolean;
  writeForm?: ReactNode;
  loginHref?: string;
  formatDate?: (iso: string) => string;
  renderReviewActions?: (review: ReviewsBlockItem) => ReactNode;
};

export function ReviewsBlock({
  data,
  className = '',
  showMoreRemaining = 0,
  onShowMore,
  showWriteSection = false,
  writeForm,
  loginHref,
  formatDate,
  renderReviewActions,
}: ReviewsBlockProps) {
  const { t } = useTranslation('common');

  const total = data?.total ?? 0;
  const hasReviews = total > 0 && data != null;
  const formatReviewDate =
    formatDate ??
    ((iso: string) => {
      try {
        return new Date(iso).toLocaleDateString();
      } catch {
        return iso;
      }
    });

  return (
    <section
      className={`rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5 ${className}`.trim()}
    >
      <h2 className="text-[20px] font-semibold tracking-tight text-foreground">{t('reviews.title')}</h2>

      {hasReviews ? (
        <>
          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="shrink-0 text-center lg:w-[140px] lg:text-left">
              <p className="text-[40px] font-bold leading-none text-foreground">{data.average.toFixed(1)}</p>
              <div className="mt-2 flex justify-center lg:justify-start">
                <RatingStars value={data.average} size={18} className="[&_.rating-stars__value]:sr-only" />
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground">{t('reviews.basedOn', { count: total })}</p>
            </div>

            <ul className="min-w-0 flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = data.distribution[stars - 1] ?? 0;
                const width = total > 0 ? `${(count / total) * 100}%` : '0%';
                return (
                  <li key={stars} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <span className="inline-flex w-5 items-center justify-end gap-0.5">
                      {stars}
                      <Star size={14} strokeWidth={1.5} className="text-star" aria-hidden="true" />
                    </span>
                    <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-card-muted">
                      <span className="block h-full rounded-full bg-star" style={{ width }} />
                    </span>
                    <span className="w-8 shrink-0 text-right tabular-nums">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {data.items.length > 0 ? (
            <ul className="mt-6 flex flex-col gap-3">
              {data.items.map((review) => (
                <li
                  key={review.id}
                  className="rounded-2xl border border-border bg-background p-4 [overflow-wrap:anywhere]"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[15px] font-semibold text-foreground">
                      {formatReviewAuthorName(review.authorName)}
                      {review.mine ? (
                        <span className="ml-2 text-[13px] font-normal text-muted-foreground">
                          ({t('reviews.you')})
                        </span>
                      ) : null}
                    </span>
                    <RatingStars value={review.rating} size={14} className="[&_.rating-stars__value]:sr-only" />
                    <span className="ml-auto text-[13px] text-muted-foreground">{formatReviewDate(review.createdAt)}</span>
                  </div>
                  {review.comment ? (
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  ) : null}
                  {renderReviewActions?.(review)}
                </li>
              ))}
            </ul>
          ) : null}

          {showMoreRemaining > 0 && onShowMore ? (
            <Button type="button" variant="ghost" className="mt-4 w-full" onClick={onShowMore}>
              {t('reviews.showMore', { count: showMoreRemaining })}
            </Button>
          ) : null}
        </>
      ) : (
        <EmptyState className="mt-6">{t('reviews.emptyHeading')}</EmptyState>
      )}

      {showWriteSection ? (
        <div className="mt-6 border-t border-border pt-6">
          {writeForm ??
            (loginHref ? (
              <p className="text-[15px] text-muted-foreground">
                <a href={loginHref} className="font-semibold text-primary-text hover:underline">
                  {t('reviews.loginToReview')}
                </a>
              </p>
            ) : null)}
        </div>
      ) : null}
    </section>
  );
}

export type ReviewsWriteFormProps = {
  rating: number;
  onRatingChange: (value: number) => void;
  comment: string;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
  pending?: boolean;
  error?: string | null;
  submitLabel: string;
  heading: string;
  ratingLabel: string;
  commentPlaceholder: string;
};

/** Presentational write-review form wired to ReviewsBlock. */
export function ReviewsWriteForm({
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  onSubmit,
  pending = false,
  error = null,
  submitLabel,
  heading,
  ratingLabel,
  commentPlaceholder,
}: ReviewsWriteFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold text-foreground">{heading}</h3>
      <ReviewStarPicker value={rating} onChange={onRatingChange} label={ratingLabel} disabled={pending} />
      <div>
        <FieldLabel htmlFor="reviews-block-comment" hidden>
          {heading}
        </FieldLabel>
        <textarea
          id="reviews-block-comment"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder={commentPlaceholder}
          disabled={pending}
          className={`${controlClass('md')} resize-y py-2.5`}
        />
      </div>
      {error ? (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="button" disabled={pending || rating < 1} onClick={onSubmit}>
        {submitLabel}
      </Button>
    </div>
  );
}

export default ReviewsBlock;
