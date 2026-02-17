import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';

export default function ServiceHeader({ service, ratingValue, reviewsCount }) {
  const { t } = useTranslation('services');
  const location = service.location;

  return (
    <section className="service-detail-page__header mt-4 rounded-xl border border-border bg-card p-4 sm:mt-6 sm:rounded-2xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="service-name">{service.name}</h1>
            {service.verified && (
              <span className="verified-badge flex-shrink-0">{t('header.verified')}</span>
            )}
          </div>

          <div className="service-meta">
            <span className="capitalize">
              {service.type && ['garage', 'official', 'detailing', 'tire', 'electric', 'body'].includes(service.type)
                ? t(`filters.serviceTypes.${service.type}`)
                : (service.type || '')}
            </span>
            {ratingValue > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <RatingStars value={ratingValue} count={0} />
                {reviewsCount > 0 && (
                  <span className="text-muted-foreground">({t('header.reviews', { count: reviewsCount })})</span>
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
            aria-label={t('header.shareAria')}
          >
            <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden min-[425px]:inline">{t('header.share')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
