import { Link } from 'react-router-dom';
import { Check, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { SpecialistProfile } from '@/specialists/types/specialist.types';
import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Badge } from '@/shared/ui/Badge';
import { Chip } from '@/shared/ui/Chip';
import Button from '@/shared/ui/button';
import { PromotionBadge } from '@/features/promotions/components/PromotionBadge';
import { formatPrice } from '@/lib/format';

type SpecialistCardProps = {
  specialist: SpecialistProfile;
  className?: string;
};

const SpecialistCard = ({ specialist, className = '' }: SpecialistCardProps) => {
  const { t } = useTranslation('specialists');

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

  const hasRating = Number.isFinite(rating);
  const displayReviews = Number.isFinite(reviewsCount) ? reviewsCount! : 0;
  const years = experienceYears ?? yearsExperience ?? null;
  const chips = (specializations ?? []).slice(0, 3);

  return (
    <CardWrapper
      as="article"
      hover
      className={`relative flex h-full flex-col items-center p-4 text-center [overflow-wrap:anywhere] ${className}`.trim()}
    >
      {promotionTier ? (
        <div className="absolute left-3 top-3">
          <PromotionBadge tier={promotionTier} />
        </div>
      ) : null}

      <div className="relative">
        <div className="h-[72px] w-[72px] overflow-hidden rounded-full bg-card-muted">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[18px] font-semibold text-muted-foreground">
              {(name ?? '').slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        {verified ? (
          <span
            className="absolute bottom-0 right-0 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-success text-success-foreground ring-2 ring-card"
            aria-label={t('card.verified')}
          >
            <Check size={12} strokeWidth={1.5} aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-[17px] font-semibold leading-snug text-foreground">
        <Link to={`/specialists/${slug || id}`} className="after:absolute after:inset-0 after:content-['']">
          {name}
        </Link>
      </h3>

      {(hasRating || years !== null) ? (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {hasRating ? (
            <RatingStars value={rating!} countLabel={t('card.reviews', { count: displayReviews })} />
          ) : null}
          {years !== null ? (
            <span className="text-[13px] text-muted-foreground">
              {hasRating ? <span aria-hidden="true">· </span> : null}
              {t('card.experience', { count: years })}
            </span>
          ) : null}
        </div>
      ) : null}

      {location ? (
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <MapPin size={14} strokeWidth={1.5} aria-hidden="true" />
          {location}
        </p>
      ) : null}

      {chips.length > 0 ? (
        <ul className="mt-3 flex list-none flex-wrap justify-center gap-1.5">
          {chips.map((spec) => (
            <li key={spec}>
              <Chip>{t(`specializations.${spec}`, { defaultValue: spec })}</Chip>
            </li>
          ))}
        </ul>
      ) : null}

      {priceFrom != null ? (
        <p className="mt-3 text-[15px] font-semibold text-foreground">
          {t('card.priceFrom', { price: formatPrice(priceFrom, 'AZN') })}
        </p>
      ) : (
        <p className="mt-3 text-[15px] font-semibold text-muted-foreground">{t('card.priceOnRequest')}</p>
      )}

      {typeof available === 'boolean' ? (
        <Badge variant={available ? 'openNow' : 'closed'} className="mt-1">
          {available ? t('card.available') : t('card.unavailable')}
        </Badge>
      ) : null}

      <div className="flex-1" />

      <Button asChild variant="secondary" className="relative z-10 mt-4 w-full">
        <Link to={`/specialists/${slug || id}`}>{t('card.viewProfile')}</Link>
      </Button>
    </CardWrapper>
  );
};

export default SpecialistCard;
