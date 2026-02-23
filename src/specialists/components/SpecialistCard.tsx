import { ArrowRight, BadgeCheck, Clock, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SpecialistProfile } from '@/specialists/types/specialist.types';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Badge } from '@/shared/ui/Badge';
import { LocationBadge } from '@/shared/ui/LocationBadge';
import { CardCTA } from '@/shared/ui/CardCTA';

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
    location,
    specializations,
    verified,
  } = specialist;

  const displayRating = Number.isFinite(rating) ? rating : 0;
  const displayReviews = Number.isFinite(reviewsCount) ? reviewsCount : 0;
  const displayExperience = Number.isFinite(experienceYears) ? experienceYears : 0;
  const safeSpecializations = specializations ?? [];

  return (
    <CardWrapper hover className={`flex flex-col p-6 ${className}`}>
      {/* Header: Avatar + Verified Pill */}
      <div className="flex items-start justify-between">
        <div className="relative">
          <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-border bg-muted">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground">
                {(name ?? '').slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          {verified && (
            <span className="absolute bottom-0 left-0 flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground">
              <BadgeCheck size={14} aria-hidden="true" />
            </span>
          )}
        </div>

        {verified && (
          <Badge variant="verified">
            <BadgeCheck size={12} aria-hidden="true" />
            {t('card.verified')}
          </Badge>
        )}
      </div>

      {/* Name */}
      <h4 className="text-xl font-semibold text-foreground">{name}</h4>

      {/* Rating */}
      <div className="flex items-center gap-1.5">
        <Star size={16} className="fill-warning text-warning" aria-hidden="true" />
        <span className="text-base font-semibold text-foreground">
          {displayRating.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">
          ({t('card.reviews', { count: displayReviews })})
        </span>
      </div>

      {/* Meta: Experience + Location */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={16} aria-hidden="true" />
          <span>{t('card.experience', { count: displayExperience })}</span>
        </div>
        {location && <LocationBadge location={location} size="md" className="flex" />}
      </div>

      {/* Specializations */}
      {safeSpecializations.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {safeSpecializations.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="rounded-full border border-primary/30 bg-primary/10 px-1.5 py-1 text-xs font-medium text-primary"
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* CTA Button */}
      <CardCTA
        to={`/specialists/${slug || id}`}
        variant="primary"
        fullWidth
        className="mt-6 gap-2 py-3.5 text-sm"
      >
        {t('card.viewProfile')}
        <ArrowRight size={16} aria-hidden="true" />
      </CardCTA>
    </CardWrapper>
  );
};

export default SpecialistCard;
