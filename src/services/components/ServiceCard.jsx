import { Link } from 'react-router-dom';
import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';

const TYPE_LABELS = {
  garage: 'Garage',
  official: 'Official',
  detailing: 'Detailing',
  tire: 'Tire',
  electric: 'Electric',
  body: 'Body',
};

const ServiceCard = ({ service }) => {
  if (!service) return null;

  const ratingValue = Number.isFinite(service.rating) ? service.rating : 0;
  const reviewsCount = Number.isFinite(service.reviewsCount) ? service.reviewsCount : 0;
  const typeLabel = TYPE_LABELS[service.type] || service.type || 'Service';
  const city = service.location?.city || '';
  const cover = service.media?.cover;

  const promotedBadge =
    service.promotedLevel === 'premium'
      ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
      : service.promotedLevel === 'boosted'
        ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
        : null;

  const verifiedBadge = service.verified
    ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
    : null;

  return (
    <article className="flex h-full w-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
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
                ✓ Verified
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-3">

        {/* NAME */}
        <h4 className="flex items-start mt-2 text-base font-semibold leading-snug text-slate-900">
          {service.name}
        </h4>

        {/* TYPE + CATEGORIES */}
        <p className="flex items-start text-sm text-slate-500">
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
          <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
            <span aria-hidden="true">📍</span>
            <span className="truncate">{city}</span>
          </div>
        ) : null}

        {/* PRICE RANGE / AVG CHECK */}
        {service.avgCheck ? (
          <div className="flex items-start mt-2 text-sm text-slate-600">
            Avg. check: {service.avgCheck} {service.services?.[0]?.currency || '€'}
          </div>
        ) : service.priceRange ? (
          <div className="mt-2 text-sm text-slate-600">
            Price range: {'$'.repeat(service.priceRange)}
          </div>
        ) : null}

        {/* SPACER */}
        <div className="flex-1" />

        {/* DIVIDER */}
        <div className="border-t border-slate-200 my-3" />

        {/* BUTTON */}
        <Link
          to={`/services/${service.slug || service.id}`}
          className="rounded-xl bg-[#416E97] px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          View service →
        </Link>
      </div>
    </article>
  );
};

export default ServiceCard;
