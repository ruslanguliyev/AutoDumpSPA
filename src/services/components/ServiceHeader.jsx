import { Share2 } from 'lucide-react';
import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';

export default function ServiceHeader({ service, ratingValue, reviewsCount }) {
  const location = service.location;

  return (
    <section className="service-detail-page__header mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="service-name">{service.name}</h1>
            {service.verified && (
              <span className="verified-badge">VERIFIED</span>
            )}
          </div>

          <div className="service-meta">
            <span className="capitalize">{service.type}</span>
            {ratingValue > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <RatingStars value={ratingValue} count={0} />
                {reviewsCount > 0 && (
                  <span className="text-slate-500">({reviewsCount} reviews)</span>
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>
    </section>
  );
}
