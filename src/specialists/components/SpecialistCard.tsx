import { BadgeCheck, Smartphone, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SpecialistBadge from '@/specialists/components/SpecialistBadge';
import type { SpecialistProfile } from '@/specialists/types/specialist.types';

type SpecialistCardProps = {
  specialist: SpecialistProfile;
  className?: string;
};

const getInitials = (name: string) => {
  const safe = name.trim();
  if (!safe) return '??';
  return safe.slice(0, 2).toUpperCase();
};

const SpecialistCard = ({ specialist, className = '' }: SpecialistCardProps) => {
  const { t } = useTranslation('specialists');
  if (!specialist) return null;

  const ratingValue = Number.isFinite(specialist.rating) ? Number(specialist.rating) : 0;
  const reviewsCount = Number.isFinite(specialist.reviewsCount)
    ? Number(specialist.reviewsCount)
    : 0;
  const experienceYears = Number.isFinite(specialist.experienceYears)
    ? Number(specialist.experienceYears)
    : null;

  const hasDescription = Boolean(specialist.description?.trim());
  const slug = specialist.slug || specialist.id;

  return (
    <article
      className={`flex h-full w-full flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow)] transition hover:shadow-[var(--shadow)] ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
          {specialist.avatarUrl ? (
            <img
              src={specialist.avatarUrl}
              alt={specialist.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
              {getInitials(specialist.name)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{specialist.name}</h3>
            {specialist.verified ? (
              <SpecialistBadge
                label={t('card.verified')}
                variant="verified"
                icon={<BadgeCheck size={12} aria-hidden="true" />}
              />
            ) : null}
            {specialist.mobileService ? (
              <SpecialistBadge
                label={t('card.mobileService')}
                variant="mobile"
                icon={<Smartphone size={12} aria-hidden="true" />}
              />
            ) : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {ratingValue > 0 ? (
              <span className="inline-flex items-center gap-1 text-foreground">
                <Star size={14} className="text-warning" aria-hidden="true" />
                <span className="font-medium">{ratingValue.toFixed(1)}</span>
              </span>
            ) : null}
            <span className="text-muted-foreground">
              {t('card.reviews', { count: reviewsCount })}
            </span>
            {experienceYears !== null ? (
              <span className="text-muted-foreground">
                {t('card.experience', { count: experienceYears })}
              </span>
            ) : null}
          </div>

          {hasDescription ? (
            <p className="mt-3 text-sm text-muted-foreground">{specialist.description}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex-1" />

      <Link
        to={`/specialists/${slug}`}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
      >
        {t('card.viewProfile')}
      </Link>
    </article>
  );
};

export default SpecialistCard;
