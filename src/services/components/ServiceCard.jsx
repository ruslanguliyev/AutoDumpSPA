import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';

const ServiceCard = ({ service }) => {
  const { t } = useTranslation('services');
  if (!service) return null;

  const ratingValue = Number.isFinite(service.rating) ? service.rating : 0;
  const reviewsCount = Number.isFinite(service.reviewsCount) ? service.reviewsCount : 0;
  const typeKey = service.type && ['garage', 'official', 'detailing', 'tire', 'electric', 'body'].includes(service.type)
    ? `filters.serviceTypes.${service.type}`
    : null;
  const typeLabel = typeKey ? t(typeKey) : (service.type || t('card.fallbackType'));
  const city = service.location?.city || '';
  const cover = service.media?.cover;

  const promotedBadge =
    service.promotedLevel === 'premium'
      ? 'bg-premium/10 text-premium ring-1 ring-premium/30'
      : service.promotedLevel === 'boosted'
        ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
        : null;

  const verifiedBadge = service.verified
    ? 'bg-success/10 text-success ring-1 ring-success/30'
    : null;

  return (
    <article className="flex h-full w-full flex-col rounded-2xl border border-border bg-card shadow-[var(--shadow)] transition hover:shadow-[var(--shadow)]">
      {/* COVER IMAGE */}
      {cover ? (
        <div className="relative h-42 w-full overflow-hidden rounded-t-2xl">
          <img src={cover} alt={service.name} className="h-full w-full object-cover" />
          {/* BADGES */}
          <div className="absolute top-3 right-3 flex flex-wrap gap-1">
            {promotedBadge ? (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${promotedBadge}`}>
                {service.promotedLevel}
              </span>
            ) : null}
            {verifiedBadge ? (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${verifiedBadge}`}>
                {t('card.verified')}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-3">

        {/* NAME */}
        <h4 className="flex items-start mt-2 text-base font-semibold leading-snug text-foreground">
          {service.name}
        </h4>

        {/* TYPE + CATEGORIES */}
        <p className="flex items-start text-sm text-muted-foreground">
          {typeLabel}
          {service.categories && service.categories.length > 0
            ? ` · ${service.categories.slice(0, 2).join(', ')}`
            : null}
        </p>

        {/* RATING */}
        <div className="mt-2">
          <RatingStars value={ratingValue} count={reviewsCount} />
        </div>

        {/* LOCATION */}
        {city ? (
          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} className="text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{city}</span>
          </div>
        ) : null}

        {/* PRICE RANGE / AVG CHECK */}
        {service.avgCheck ? (
          <div className="flex items-start mt-2 text-sm text-muted-foreground">
            {t('card.avgCheck')}: {service.avgCheck} {service.services?.[0]?.currency || '€'}
          </div>
        ) : service.priceRange ? (
          <div className="mt-2 text-sm text-muted-foreground">
            {t('card.priceRange')}: {'$'.repeat(service.priceRange)}
          </div>
        ) : null}

        {/* SPACER */}
        <div className="flex-1" />

        {/* DIVIDER */}
        <div className="border-t border-border my-3" />

        {/* BUTTON */}
        <Link
          to={`/services/${service.slug || service.id}`}
          className="rounded-xl bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
        >
          {t('card.viewService')}
        </Link>
      </div>
    </article>
  );
};

export default ServiceCard;
