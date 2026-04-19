import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SpecialistReview } from '@/specialists/types/specialist.types';

type SpecialistReviewsPreviewProps = {
  reviews: SpecialistReview[];
  totalCount: number;
};

const formatRelativeDate = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  return date.toLocaleDateString();
};

const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'fill-warning text-warning' : 'text-border'}
        aria-hidden="true"
      />
    ))}
  </div>
);

const SpecialistReviewsPreview = ({ reviews, totalCount }: SpecialistReviewsPreviewProps) => {
  const { t } = useTranslation('specialists');

  const preview = reviews[0] ?? null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow)] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-foreground">{t('detail.recentReviews')}</h2>
        {totalCount > 0 ? (
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t('detail.viewAll', { count: totalCount })}
          </button>
        ) : null}
      </div>

      {preview ? (
        <div className="mt-4">
          <div className="flex items-start gap-3">
            {/* Reviewer avatar */}
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted border border-border">
              {preview.avatarUrl ? (
                <img
                  src={preview.avatarUrl}
                  alt={preview.authorName ?? ''}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                  {(preview.authorName ?? '?').slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-medium text-foreground">
                  {preview.authorName ?? t('detail.reviewsAnonymous')}
                </span>
                {preview.createdAt ? (
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(preview.createdAt)}
                  </span>
                ) : null}
              </div>
              <StarRow rating={preview.rating} />
            </div>
          </div>

          {preview.comment ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {preview.comment}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">{t('detail.empty.reviews')}</p>
      )}
    </section>
  );
};

export default SpecialistReviewsPreview;
