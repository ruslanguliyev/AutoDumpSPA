import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type HighlightItem = {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
};

type SpecialistHighlightsProps = {
  description?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
};

const SpecialistHighlights = ({
  description,
  rating,
  reviewsCount,
}: SpecialistHighlightsProps) => {
  const { t } = useTranslation('specialists');

  const ratingValue = Number.isFinite(rating) ? Number(rating) : null;
  const reviewCount = Number.isFinite(reviewsCount) ? Number(reviewsCount) : 0;
  const showRating = reviewCount > 0 && ratingValue !== null;

  const highlights: HighlightItem[] = showRating
    ? [
        {
          id: 'rated',
          icon: <ShieldCheck size={16} aria-hidden="true" />,
          title: t('detail.highlightRatedTitle'),
          subtitle: `${ratingValue.toFixed(1)} · ${t('card.reviews', { count: reviewCount })}`,
        },
      ]
    : [];

  return (
    <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:grid-cols-2 sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t('detail.about')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {description ?? t('detail.empty.description')}
        </p>
      </div>

      <div>
        <h2 className="text-base text-center font-semibold text-foreground">{t('detail.highlights')}</h2>
        {highlights.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {highlights.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className="mb-1 text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mb-1 text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-center text-sm text-muted-foreground">{t('detail.noReviewsYet')}</p>
        )}
      </div>
    </div>
  );
};

export default SpecialistHighlights;
