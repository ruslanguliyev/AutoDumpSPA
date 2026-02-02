import { Share2 } from 'lucide-react';
import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';

export default function ServiceHeader({ service, ratingValue, reviewsCount }) {
  const location = service.location;

  return (
    <section className="service-detail-page__header mt-4 rounded-xl border border-border bg-card p-4 sm:mt-6 sm:rounded-2xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="service-name">{service.name}</h1>
            {service.verified && (
              <span className="verified-badge flex-shrink-0">VERIFIED</span>
            )}
          </div>

          <div className="service-meta">
            <span className="capitalize">{service.type}</span>
            {ratingValue > 0 && (
              <>
                <span className="text-muted-foreground/60">•</span>
                <RatingStars value={ratingValue} count={0} />
                {reviewsCount > 0 && (
                  <span className="text-muted-foreground">({reviewsCount} reviews)</span>
                )}
              </>
            )}
          </div>

          {location?.address && (
            <p className="service-address">
              {location.address}, {location.city}, {location.country}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 sm:self-start">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted sm:gap-2 sm:px-3 sm:text-sm"
            aria-label="Share service"
          >
            <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden min-[425px]:inline">Share</span>
          </button>
        </div>
      </div>
    </section>
  );
}
