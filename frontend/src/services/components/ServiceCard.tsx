import { useTranslation } from 'react-i18next';
import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Badge } from '@/shared/ui/Badge';
import { LocationBadge } from '@/shared/ui/LocationBadge';
import { CardCTA } from '@/shared/ui/CardCTA';
import type { ServiceProfile } from '@/services/types/service.types';

type ServiceCardProps = {
  service: ServiceProfile | null;
};

const ServiceCard = ({ service }: ServiceCardProps) => {
  const { t } = useTranslation('services');
  if (!service) return null;

  const ratingValue = Number.isFinite(service.rating) ? service.rating! : 0;
  const reviewsCount = Number.isFinite(service.reviewsCount) ? service.reviewsCount! : 0;
  const typeKey =
    service.type && ['garage', 'official', 'detailing', 'tire', 'electric', 'body'].includes(service.type)
      ? `filters.serviceTypes.${service.type}`
      : null;
  const typeLabel = typeKey ? t(typeKey) : service.type || t('card.fallbackType');
  const city = service.location?.city || '';
  const cover = service.media?.cover;

  const getPromotedVariant = (): 'premium' | 'boosted' | null => {
    if (service.promotedLevel === 'premium') return 'premium';
    if (service.promotedLevel === 'boosted') return 'boosted';
    return null;
  };

  const promotedVariant = getPromotedVariant();

  return (
    <CardWrapper className="flex h-full w-full flex-col">
      {/* COVER IMAGE */}
      {cover && (
        <div className="relative h-42 w-full overflow-hidden rounded-t-2xl">
          <img src={cover} alt={service.name} className="h-full w-full object-cover" />
          {/* BADGES */}
          <div className="absolute right-3 top-3 flex flex-wrap gap-1">
            {promotedVariant && (
              <Badge variant={promotedVariant} className="text-[10px]">
                {service.promotedLevel}
              </Badge>
            )}
            {service.verified && (
              <Badge variant="verified" className="text-[10px]">
                {t('card.verified')}
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-3">
        {/* NAME */}
        <h4 className="mt-2 flex items-start text-base font-semibold leading-snug text-foreground">
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
        {city && <LocationBadge location={city} size="md" className="mt-2 flex" />}

        {/* PRICE RANGE / AVG CHECK */}
        {service.avgCheck ? (
          <div className="mt-2 flex items-start text-sm text-muted-foreground">
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
        <div className="my-3 border-t border-border" />

        {/* BUTTON */}
        <CardCTA
          to={`/services/${service.slug || service.id}`}
          variant="brand"
          fullWidth
          className="py-2.5 text-sm"
        >
          {t('card.viewService')}
        </CardCTA>
      </div>
    </CardWrapper>
  );
};

export default ServiceCard;
