import { useTranslation } from 'react-i18next';

type SpecialistHighlightsProps = {
  description?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
};

const tileClass =
  'flex min-h-11 min-w-0 flex-col justify-center rounded-[var(--radius)] border border-dashed border-border-strong px-3 py-2 dark:border-border';

const SpecialistHighlights = ({ description, rating, reviewsCount }: SpecialistHighlightsProps) => {
  const { t } = useTranslation('specialists');

  const ratingValue = Number.isFinite(rating) ? Number(rating) : null;
  const reviewCount = Number.isFinite(reviewsCount) ? Number(reviewsCount) : 0;
  const showRating = reviewCount > 0 && ratingValue !== null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5 [overflow-wrap:anywhere]">
      <h2 className="text-[20px] font-semibold tracking-tight text-foreground">{t('detail.about')}</h2>
      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground">
        {description?.trim() ? description : t('detail.empty.description')}
      </p>

      <h3 className="mt-5 text-[15px] font-semibold text-foreground">{t('detail.highlights')}</h3>
      {showRating ? (
        <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className={tileClass}>
            <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {t('detail.highlightRatedTitle')}
            </dt>
            <dd className="mt-1 text-[15px] font-semibold text-foreground">
              {ratingValue.toFixed(1)} · {t('card.reviews', { count: reviewCount })}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-[15px] text-muted-foreground">{t('detail.noReviewsYet')}</p>
      )}
    </section>
  );
};

export default SpecialistHighlights;
