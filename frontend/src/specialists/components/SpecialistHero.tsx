import { BadgeCheck, MapPin, Star, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SpecialistDetail } from '@/specialists/types/specialist.types';
import './SpecialistHero.scss';

type SpecialistHeroProps = {
  specialist: SpecialistDetail;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const SpecialistHero = ({ specialist }: SpecialistHeroProps) => {
  const { t } = useTranslation('specialists');

  const ratingValue = Number.isFinite(specialist.rating) ? Number(specialist.rating) : null;
  const reviewsCount = Number.isFinite(specialist.reviewsCount)
    ? Number(specialist.reviewsCount)
    : 0;
  const yearsExperienceValue = Number.isFinite(specialist.yearsExperience)
    ? Number(specialist.yearsExperience)
    : Number.isFinite(specialist.experienceYears)
      ? Number(specialist.experienceYears)
      : null;
  const safeSpecializations = specialist.specializations ?? [];
  const locationLabel = specialist.location ?? null;
  const banner = specialist.banner ?? specialist.coverImage ?? null;
  const avatar = specialist.avatar ?? specialist.avatarUrl ?? null;

  const hasExp = yearsExperienceValue !== null;
  const hasRating = ratingValue !== null;
  const hasLocation = Boolean(locationLabel);

  return (
    <section className="specialist-hero">
      {/* Banner */}
      <div className="specialist-hero__banner">
        {banner ? (
          <img
            src={banner}
            alt=""
            aria-hidden="true"
            className="specialist-hero__banner-img"
            loading="eager"
          />
        ) : (
          <div className="specialist-hero__banner-placeholder" />
        )}
      </div>

      {/* Content — two columns: left avatar, right info */}
      <div className="specialist-hero__content">
        <div className="specialist-hero__row">
          {/* Left column — avatar (overlaps banner) */}
          <div className="specialist-hero__avatar-col">
            <div className="specialist-hero__avatar-inner">
              <div className="specialist-hero__avatar">
                {avatar ? (
                  <img src={avatar} alt={specialist.name} />
                ) : (
                  <div className="specialist-hero__avatar-initials">
                    {getInitials(specialist.name)}
                  </div>
                )}
              </div>
              {specialist.verified ? (
                <span className="specialist-hero__verified-badge">
                  <BadgeCheck size={12} aria-hidden="true" />
                </span>
              ) : null}
            </div>
          </div>

          {/* Right column — name, meta, chips */}
          <div className="specialist-hero__info-col">
            <div className="specialist-hero__name-row">
              <h1 className="specialist-hero__name">{specialist.name}</h1>
              {specialist.verified ? (
                <span className="specialist-hero__master-badge">Master Tech</span>
              ) : null}
            </div>

            {/* Meta row */}
            <div className="specialist-hero__meta-row">
              {hasExp ? (
                <span className="specialist-hero__meta-item">
                  <User size={16} aria-hidden="true" />
                  {yearsExperienceValue} {t('detail.yearsExp')}
                </span>
              ) : null}
              {hasRating ? (
                <span className="specialist-hero__meta-item">
                  <Star size={16} className="specialist-hero__meta-star" aria-hidden="true" />
                  <span className="specialist-hero__meta-rating">{ratingValue?.toFixed(1)}</span>
                </span>
              ) : null}
              {hasRating ? (
                <button type="button" className="specialist-hero__reviews-link">
                  {t('card.reviews', { count: reviewsCount })}
                </button>
              ) : null}
              {hasLocation ? (
                <span className="specialist-hero__meta-item specialist-hero__meta-item--location">
                  <MapPin size={16} aria-hidden="true" />
                  {locationLabel}
                </span>
              ) : null}
            </div>

            {/* Specialization chips */}
            {safeSpecializations.length > 0 ? (
              <div className="specialist-hero__chips">
                {safeSpecializations.map((item) => (
                  <span key={item} className="specialist-hero__chip">
                    {t(`specializations.${item}`)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialistHero;
