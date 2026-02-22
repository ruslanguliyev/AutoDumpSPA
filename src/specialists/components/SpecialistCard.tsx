import { ArrowRight, BadgeCheck, Clock, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SpecialistProfile } from '@/specialists/types/specialist.types';

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
    <article
      className={`
        flex flex-col rounded-2xl bg-card p-6
        shadow-[var(--shadow)] transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
        ${className}
      `}
    >
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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <BadgeCheck size={14} aria-hidden="true" />
            {t('card.verified')}
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="text-xl font-semibold text-foreground">{name}</h3>

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
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={16} aria-hidden="true" />
            <span>{location}</span>
          </div>
        )}
      </div>

      {/* Specializations */}
      {safeSpecializations.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {safeSpecializations.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400"
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {/* CTA Button */}
      <Link
        to={`/specialists/${slug || id}`}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-none bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground no-underline outline-none transition-all hover:brightness-110 hover:no-underline"
      >
        {t('card.viewProfile')}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
};

export default SpecialistCard;
