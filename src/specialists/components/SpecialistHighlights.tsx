import { Award, ShieldCheck, Zap } from 'lucide-react';
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
  const reviewCount = Number.isFinite(reviewsCount) ? Number(reviewsCount) : null;

  const highlights: HighlightItem[] = [
    {
      id: 'fast',
      icon: <Zap size={16} aria-hidden="true" />,
      title: t('detail.highlightFastTitle'),
      subtitle: t('detail.highlightFastDesc'),
    },
    {
      id: 'rated',
      icon: <ShieldCheck size={16} aria-hidden="true" />,
      title: t('detail.highlightRatedTitle'),
      subtitle:
        ratingValue !== null && reviewCount !== null
          ? `${ratingValue.toFixed(1)} · ${reviewCount} ${t('card.reviews', { count: reviewCount })}`
          : t('detail.highlightRatedDesc'),
    },
    {
      id: 'warranty',
      icon: <Award size={16} aria-hidden="true" />,
      title: t('detail.highlightWarrantyTitle'),
      subtitle: t('detail.highlightWarrantyDesc'),
    },
  ];

  return (
    <div className="grid gap-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow)] sm:grid-cols-2 sm:p-6">
      {/* About */}
      <div>
        <h2 className="text-base font-semibold text-foreground">{t('detail.about')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {description ?? t('detail.empty.description')}
        </p>
      </div>

      {/* Highlights */}
      <div>
        <h2 className="text-base font-semibold text-foreground">{t('detail.highlights')}</h2>
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
      </div>
    </div>
  );
};

export default SpecialistHighlights;
