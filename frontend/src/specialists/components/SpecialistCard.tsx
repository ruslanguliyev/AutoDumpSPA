import { Link } from 'react-router-dom';
import { Check, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { SpecialistProfile } from '@/specialists/types/specialist.types';
import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { PromotionBadge } from '@/features/promotions/components/PromotionBadge';
import { formatPrice, intlLocale } from '@/lib/format';

type SpecialistCardProps = {
  specialist: SpecialistProfile;
  className?: string;
};

const SpecialistCard = ({ specialist, className = '' }: SpecialistCardProps) => {
  const { t, i18n } = useTranslation('specialists');
  const locale = intlLocale(i18n.language);

  const {
    id,
    slug,
    name,
    avatarUrl,
    rating,
    reviewsCount,
    experienceYears,
    yearsExperience,
    location,
    specializations,
    verified,
    available,
    priceFrom,
    promotionTier,
  } = specialist;

  const ratingValue = Number.isFinite(rating) ? Number(rating) : null;
  const displayReviews = Number.isFinite(reviewsCount) ? Number(reviewsCount) : 0;
  const showRating = displayReviews > 0 && ratingValue !== null;
  const years = experienceYears ?? yearsExperience ?? null;
  const chips = (specializations ?? []).slice(0, 3);

  return (
    <CardWrapper
      as="article"
      hover
      className={`group relative flex h-full flex-col p-5 [overflow-wrap:anywhere] ${className}`.trim()}
    >
      {/* Top row: experience pill + availability status */}
      <div className="mb-3 flex min-h-[26px] items-center justify-between gap-2 text-xs">
        {years !== null ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card-muted px-2.5 py-1 font-medium text-foreground">
            <Clock size={14} strokeWidth={2} className="text-primary-text" aria-hidden="true" />
            {t('card.experience', { count: years })}
          </span>
        ) : (
          <span />
        )}
        {typeof available === 'boolean' ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
              available
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-border bg-card-muted text-muted-foreground'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${available ? 'bg-success' : 'bg-muted-foreground'}`} />
            {available ? t('card.available') : t('card.unavailable')}
          </span>
        ) : null}
      </div>

      {promotionTier ? (
        <div className="mb-2 flex justify-center">
          <PromotionBadge tier={promotionTier} />
        </div>
      ) : null}

      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-border-strong bg-gradient-to-br from-card-muted to-card text-2xl font-bold tracking-wider text-foreground shadow-inner transition-transform duration-300 group-hover:scale-105">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <span>{(name ?? '').slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          {verified ? (
            <span
              className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-success text-success-foreground shadow-md"
              aria-label={t('card.verified')}
              title={t('card.verified')}
            >
              <Check size={14} strokeWidth={3} aria-hidden="true" />
            </span>
          ) : null}
        </div>

        <h3 className="mt-3.5 text-xl font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary-text">
          <Link to={`/specialists/${slug || id}`} className="after:absolute after:inset-0 after:content-['']">
            {name}
          </Link>
        </h3>

        <div className="mt-1.5 flex flex-col items-center gap-1">
          {showRating ? (
            <RatingStars value={ratingValue} countLabel={t('card.reviews', { count: displayReviews })} />
          ) : (
            <p className="text-[13px] text-muted-foreground">{t('detail.noReviewsYet')}</p>
          )}
        </div>

        {location ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <MapPin size={14} strokeWidth={1.5} aria-hidden="true" />
            {location}
          </p>
        ) : null}
      </div>

      {chips.length > 0 ? (
        <ul className="mt-4 flex list-none flex-wrap justify-center gap-2">
          {chips.map((spec) => (
            <li key={spec}>
              <span className="inline-flex rounded-lg border border-border bg-card-muted px-3.5 py-1.5 text-xs font-medium text-foreground">
                {t(`specializations.${spec}`, { defaultValue: spec })}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex-1" />

      {/* Price block: the reference pairs an uppercase label with the price inside a bordered bar.
          Its right-hand status chip lives in the top row here — `available` is the only field
          behind it, and showing the same word twice on one card reads as a mistake. */}
      <div className="mb-4 mt-5 flex items-center justify-between gap-3 rounded-xl border border-border bg-card-muted/60 px-4 py-3 text-left">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t('card.priceLabel')}
          </span>
          {priceFrom != null ? (
            <span className="text-lg font-bold tracking-tight text-foreground">
              {t('card.priceFrom', { price: formatPrice(priceFrom, 'AZN', locale) })}
            </span>
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">{t('card.priceOnRequest')}</span>
          )}
        </div>
      </div>

      <Link
        to={`/specialists/${slug || id}`}
        className="relative z-10 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-accent px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <span>{t('card.viewProfile')}</span>
        <ChevronRight size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </CardWrapper>
  );
};

export default SpecialistCard;
