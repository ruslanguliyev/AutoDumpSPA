import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { Review, ReviewTargetType } from '@/features/reviews/api/reviews.api';
import { useDeleteReview, useReviews, useSubmitReview } from '@/features/reviews/hooks/useReviews';

const PAGE = 5;

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} className={i < Math.round(value) ? 'fill-warning text-warning' : 'text-border'} />
      ))}
    </span>
  );
}

function StarPicker({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n}`}
          onClick={() => onChange(n)}
          className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star size={26} className={n <= value ? 'fill-warning text-warning' : 'text-border'} />
        </button>
      ))}
    </div>
  );
}

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

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (rating < 1) return;
    submit.mutate({ targetType, targetId, rating, comment: comment.trim() || undefined }, { onSuccess: onDone });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <StarPicker value={rating} onChange={setRating} label={t('reviews.yourRating')} />
      <textarea
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        rows={3}
        maxLength={1000}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('reviews.commentPlaceholder')}
      />
      {submit.isError ? (
        <p role="alert" className="text-xs text-destructive">
          {submit.error.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={rating < 1 || submit.isPending}
        className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
      >
        {existing ? t('reviews.update') : t('reviews.submit')}
      </button>
    </form>
  );
}

/**
 * Real reviews of a seller, specialist or service center: summary, list and the form to write
 * (or change) your own review. The profile owner sees the list but gets an error from the API
 * if they try to review themselves, so `canReview` lets the page hide the form for them.
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
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [limit, setLimit] = useState(PAGE);
  const [editing, setEditing] = useState(false);
  const { data } = useReviews(targetType, targetId, limit);
  const remove = useDeleteReview();

  if (!targetId) return null;
  const total = data?.total ?? 0;
  const mine = data?.items.find((r) => r.mine);
  const date = (value: string) => new Date(value).toLocaleDateString(i18n.language);

  return (
    <section className={`rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow)] sm:p-6 ${className}`}>
      <h2 className="text-base font-semibold text-foreground">{t('reviews.title')}</h2>

      {total > 0 && data ? (
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="text-center sm:w-36">
            <p className="text-4xl font-bold text-foreground">{data.average.toFixed(1)}</p>
            <Stars value={data.average} size={18} />
            <p className="mt-1 text-xs text-muted-foreground">{t('reviews.basedOn', { count: total })}</p>
          </div>
          <ul className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = data.distribution[stars - 1] ?? 0;
              return (
                <li key={stars} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-3 text-right">{stars}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-warning" style={{ width: `${(count / total) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right">{count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">{t('reviews.empty')}</p>
      )}

      {canReview && !(isAuthenticated && mine && !editing) ? (
        <div className="mt-5 border-t border-border pt-5">
          {!isAuthenticated ? (
            <p className="text-sm text-muted-foreground">
              <Link to="/login" state={{ from: location }} className="font-semibold text-primary hover:underline">
                {t('reviews.loginToReview')}
              </Link>
            </p>
          ) : (
            <>
              <h3 className="mb-3 text-sm font-semibold text-foreground">{t('reviews.write')}</h3>
              <ReviewForm
                targetType={targetType}
                targetId={targetId}
                existing={mine}
                onDone={() => setEditing(false)}
              />
            </>
          )}
        </div>
      ) : null}

      {data && data.items.length > 0 ? (
        <ul className="mt-5 divide-y divide-border">
          {data.items.map((review) => (
            <li key={review.id} className="py-4 first:pt-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-sm font-medium text-foreground">
                  {review.authorName}
                  {review.mine ? <span className="ml-2 text-xs font-normal text-muted-foreground">({t('reviews.you')})</span> : null}
                </span>
                <Stars value={review.rating} size={14} />
                <span className="text-xs text-muted-foreground">{date(review.createdAt)}</span>
              </div>
              {review.comment ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
              ) : null}
              {review.mine ? (
                <div className="mt-2 flex gap-3 text-xs font-semibold">
                  <button type="button" className="text-primary hover:underline" onClick={() => setEditing(true)}>
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
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {data && total > data.items.length ? (
        <button
          type="button"
          onClick={() => setLimit((l) => l + PAGE)}
          className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          {t('reviews.showMore', { count: total - data.items.length })}
        </button>
      ) : null}
    </section>
  );
}

export default ReviewsSection;
