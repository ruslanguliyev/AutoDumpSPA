import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Badge } from '@/shared/ui/Badge';
import { Chip } from '@/shared/ui/Chip';
import Button from '@/shared/ui/button';
import { PromotionBadge } from '@/features/promotions/components/PromotionBadge';
import { isServiceOpen, normalizeServiceSchedule } from '@/services/utils/serviceSchedule.utils';
import type { ServiceProfile } from '@/services/types/service.types';
import { ListingPhoto } from '@/shared/ui/ListingImagePlaceholder';

type ServiceCardProps = {
  service: ServiceProfile | null;
};

/** Sedan silhouette of the reference design, drawn in the current text colour. */
const SedanSilhouette = () => (
  <svg
    viewBox="0 0 240 100"
    fill="currentColor"
    aria-hidden="true"
    className="h-20 w-48 drop-shadow-[0_4px_12px_rgb(0_0_0/0.35)]"
  >
    <path
      fillOpacity="0.88"
      d="M 22 68 C 25 58, 38 52, 60 52 C 70 52, 85 46, 102 36 C 118 27, 138 24, 168 25 C 192 26, 204 36, 218 52 C 228 53, 236 57, 236 67 C 236 71, 232 73, 222 73 C 221 73, 219 72, 217 68 C 212 58, 196 58, 191 68 C 190 72, 187 73, 85 73 C 84 72, 82 68, 77 68 C 72 58, 56 58, 51 68 C 50 72, 47 73, 24 73 C 20 73, 19 70, 22 68 Z"
    />
    <path
      className="text-card"
      fill="currentColor"
      fillOpacity="0.9"
      d="M 98 38 C 114 30, 132 28, 154 28 C 172 28, 185 34, 196 48 C 178 48, 142 48, 98 48 C 94 48, 92 44, 98 38 Z"
    />
    <path className="text-card" fill="currentColor" fillOpacity="0.9" d="M 93 40 C 88 44, 82 48, 74 48 L 92 48 Z" />
    <circle cx="64" cy="68" r="14" className="text-card" fill="currentColor" fillOpacity="0.55" />
    <circle cx="64" cy="68" r="6" className="text-card" fill="currentColor" fillOpacity="0.8" />
    <circle cx="204" cy="68" r="14" className="text-card" fill="currentColor" fillOpacity="0.55" />
    <circle cx="204" cy="68" r="6" className="text-card" fill="currentColor" fillOpacity="0.8" />
  </svg>
);

const ServiceCard = ({ service }: ServiceCardProps) => {
  const { t } = useTranslation('services');
  if (!service) return null;

  const reviewsCount = Number.isFinite(service.reviewsCount) ? Number(service.reviewsCount) : 0;
  const ratingValue = Number.isFinite(service.rating) ? Number(service.rating) : null;
  const showRating = reviewsCount > 0 && ratingValue !== null;
  const city = service.location?.city || '';
  const cover = service.media?.cover;
  const allBrands = service.supportedBrands ?? [];
  const brands = allBrands.slice(0, 3);
  const extraBrands = allBrands.length - brands.length;
  const target = `/services/${service.slug || service.id}`;

  // Open or closed can only be told from the opening hours; the list does not always carry them.
  const open = normalizeServiceSchedule(service.schedule) ? isServiceOpen(service.schedule) : null;

  return (
    <CardWrapper
      as="article"
      hover
      className="group relative flex h-full flex-col overflow-hidden [overflow-wrap:anywhere]"
    >
      {/* Header visual: cover photo, or the sedan silhouette over a soft blue backlight. */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-b from-card-muted to-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 55%, rgb(var(--primary) / 0.16) 0%, transparent 70%)',
          }}
        />

        {cover ? (
          <ListingPhoto
            src={cover}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-subtle-foreground/60 transition-transform duration-500 ease-out group-hover:scale-105">
            <SedanSilhouette />
          </div>
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent"
        />

        {service.promotionTier ? (
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            <PromotionBadge tier={service.promotionTier} />
          </div>
        ) : null}

        {service.verified ? (
          <div className="absolute right-3 top-3">
            <Badge variant="verified" className="bg-success/10 px-3 py-1 backdrop-blur-md">
              {t('card.verified')}
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-3.5">
        {open !== null ? (
          <Badge variant={open ? 'openNow' : 'closed'} className="text-xs font-medium">
            {open ? t('card.openNow') : t('card.closed')}
          </Badge>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-bold leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary-text">
            <Link to={target} className="after:absolute after:inset-0 after:content-['']">
              {service.name}
            </Link>
          </h3>

          {showRating ? (
            <RatingStars value={ratingValue} countLabel={t('card.reviews', { count: reviewsCount })} />
          ) : (
            <p className="text-xs text-muted-foreground">{t('header.noReviewsYet')}</p>
          )}
        </div>

        {city ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={14} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{city}</span>
          </p>
        ) : null}

        {brands.length > 0 ? (
          <ul className="flex list-none flex-wrap gap-2">
            {brands.map((brand) => (
              <li key={brand}>
                <Chip className="min-h-0 bg-card-muted px-3.5 py-1 text-xs hover:border-border-strong">
                  {brand}
                </Chip>
              </li>
            ))}
            {extraBrands > 0 ? (
              <li>
                <Chip className="min-h-0 bg-card-muted px-3.5 py-1 text-xs">
                  {t('card.brandsMore', { count: extraBrands })}
                </Chip>
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="flex-1" />

        <Button
          asChild
          variant="secondary"
          className="relative z-10 w-full rounded-xl border-primary/30 bg-primary/10 text-sm text-primary-text shadow-none transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
        >
          <Link to={target}>{t('card.bookVisit')}</Link>
        </Button>
      </div>
    </CardWrapper>
  );
};

export default ServiceCard;
