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

const ServiceCard = ({ service }: ServiceCardProps) => {
  const { t } = useTranslation('services');
  if (!service) return null;

  const reviewsCount = Number.isFinite(service.reviewsCount) ? Number(service.reviewsCount) : 0;
  const ratingValue = Number.isFinite(service.rating) ? Number(service.rating) : null;
  const showRating = reviewsCount > 0 && ratingValue !== null;
  const typeKey =
    service.type && ['garage', 'official', 'detailing', 'tire', 'electric', 'body'].includes(service.type)
      ? `filters.serviceTypes.${service.type}`
      : null;
  const typeLabel = typeKey ? t(typeKey) : null;
  const city = service.location?.city || '';
  const cover = service.media?.cover;
  const brands = service.supportedBrands?.slice(0, 3) ?? [];

  // Open or closed can only be told from the opening hours; the list does not always carry them.
  const open = normalizeServiceSchedule(service.schedule) ? isServiceOpen(service.schedule) : null;

  return (
    <CardWrapper as="article" hover className="relative flex h-full flex-col overflow-hidden [overflow-wrap:anywhere]">
      <div className="relative aspect-video w-full overflow-hidden bg-card-muted">
        <ListingPhoto src={cover} className="h-full w-full object-cover" />

        <div className="absolute right-3 top-3 flex flex-wrap items-center justify-end gap-1.5">
          <PromotionBadge tier={service.promotionTier} />
          {service.verified ? <Badge variant="verified">{t('card.verified')}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {open !== null ? (
          <Badge variant={open ? 'openNow' : 'closed'}>
            {open ? t('card.openNow') : t('card.closed')}
          </Badge>
        ) : null}

        <h3 className="text-[17px] font-semibold leading-snug text-foreground">
          <Link
            to={`/services/${service.slug || service.id}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {service.name}
          </Link>
        </h3>

        {typeLabel ? <p className="text-[13px] text-muted-foreground">{typeLabel}</p> : null}

        {showRating ? (
          <RatingStars value={ratingValue} countLabel={t('card.reviews', { count: reviewsCount })} />
        ) : (
          <p className="text-[13px] text-muted-foreground">{t('header.noReviewsYet')}</p>
        )}

        {city ? (
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <MapPin size={14} strokeWidth={1.5} aria-hidden="true" />
            {city}
          </p>
        ) : null}

        {brands.length > 0 ? (
          <ul className="flex list-none flex-wrap gap-1.5">
            {brands.map((brand) => (
              <li key={brand}>
                <Chip>{brand}</Chip>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex-1" />

        <Button asChild variant="secondary" className="relative z-10 mt-2 w-full">
          <Link to={`/services/${service.slug || service.id}`}>{t('card.bookVisit')}</Link>
        </Button>
      </div>
    </CardWrapper>
  );
};

export default ServiceCard;
