import { BadgeCheck, MapPin, Star, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SpecialistDetail } from '@/specialists/types/specialist.types';
import { Badge } from '@/shared/ui/Badge';
import { Chip } from '@/shared/ui/Chip';
import { ListingPhoto } from '@/shared/ui/ListingImagePlaceholder';

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
  const reviewsCount = Number.isFinite(specialist.reviewsCount) ? Number(specialist.reviewsCount) : 0;
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
  const showRating = reviewsCount > 0 && ratingValue !== null;
  const hasLocation = Boolean(locationLabel);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] [overflow-wrap:anywhere]">
      <div className="h-32 w-full bg-card-muted sm:h-40 lg:h-48">
        {banner ? (
          <ListingPhoto src={banner} className="h-full w-full object-cover" loading="eager" />
        ) : null}
      </div>

      <div className="relative px-4 pb-5 pt-16 sm:px-5 sm:pt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative mx-auto -mt-28 shrink-0 sm:mx-0 sm:-mt-24">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-card-muted sm:h-28 sm:w-28">
              {avatar ? (
                <ListingPhoto src={avatar} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[18px] font-semibold text-muted-foreground">
                  {getInitials(specialist.name)}
                </span>
              )}
            </div>
            {specialist.verified ? (
              <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-success text-primary-foreground">
                <BadgeCheck size={14} aria-hidden="true" />
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[26px]">
                {specialist.name}
              </h1>
              {specialist.verified ? <Badge variant="verified">{t('card.verified')}</Badge> : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground sm:justify-start">
              {hasExp ? (
                <span className="inline-flex items-center gap-1.5">
                  <User size={16} aria-hidden="true" />
                  {yearsExperienceValue} {t('detail.yearsExp')}
                </span>
              ) : null}
              {showRating ? (
                <span className="inline-flex items-center gap-1.5 text-foreground">
                  <Star size={16} className="text-star" aria-hidden="true" />
                  {ratingValue?.toFixed(1)}
                  <span className="text-muted-foreground">{t('card.reviews', { count: reviewsCount })}</span>
                </span>
              ) : (
                <span>{t('detail.noReviewsYet')}</span>
              )}
              {hasLocation ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={16} aria-hidden="true" />
                  {locationLabel}
                </span>
              ) : null}
            </div>

            {safeSpecializations.length > 0 ? (
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {safeSpecializations.map((item) => (
                  <Chip key={item}>{t(`specializations.${item}`, { defaultValue: item })}</Chip>
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
