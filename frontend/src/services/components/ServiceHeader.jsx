import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/shared/ui/Badge';
import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';
import Button from '@/shared/ui/button';
import { ListingPhoto } from '@/shared/ui/ListingImagePlaceholder';

export default function ServiceHeader({ service, reviewsCount, ratingValue }) {
  const { t } = useTranslation('services');
  const location = service.location;
  const showRating = reviewsCount > 0 && Number.isFinite(ratingValue);

  const typeKey =
    service.type && ['garage', 'official', 'detailing', 'tire', 'electric', 'body'].includes(service.type)
      ? `filters.serviceTypes.${service.type}`
      : null;
  const typeLabel = typeKey ? t(typeKey) : service.type || null;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] [overflow-wrap:anywhere]">
      {service.media?.cover ? (
        <div className="relative aspect-[3/1] max-h-40 w-full bg-card-muted">
          <ListingPhoto src={service.media.cover} className="h-full w-full object-cover" loading="eager" />
        </div>
      ) : null}

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="flex min-w-0 flex-1 gap-3">
          {service.media?.logo ? (
            <ListingPhoto
              src={service.media.logo}
              className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[26px]">{service.name}</h1>
              {service.verified ? <Badge variant="verified">{t('header.verified')}</Badge> : null}
            </div>
            {typeLabel ? <p className="mt-1 text-[13px] text-muted-foreground">{typeLabel}</p> : null}
            {showRating ? (
              <RatingStars
                value={ratingValue}
                count={reviewsCount}
                countLabel={t('header.reviews', { count: reviewsCount })}
                className="mt-2"
              />
            ) : (
              <p className="mt-2 text-[13px] text-muted-foreground">{t('header.noReviewsYet')}</p>
            )}
            {location?.address ? (
              <p className="mt-2 text-[13px] text-muted-foreground">
                {location.address}
                {location.city ? `, ${location.city}` : ''}
              </p>
            ) : null}
          </div>
        </div>

        <Button type="button" variant="secondary" className="min-h-11 shrink-0 gap-2 self-start" aria-label={t('header.shareAria')}>
          <Share2 size={18} aria-hidden="true" />
          <span className="hidden sm:inline">{t('header.share')}</span>
        </Button>
      </div>
    </section>
  );
}
