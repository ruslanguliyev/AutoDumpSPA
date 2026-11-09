import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useFavoritesStore } from '@/shared/store/favoritesStore';
import { formatPrice, formatMileage, formatYear } from '@/lib/format';
import { splitEngineSummary, translateVehicleEnum } from '@/lib/vehicleEnumLabels';
import { PromotionBadge } from '@/features/promotions/components/PromotionBadge';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Badge } from '@/shared/ui/Badge';
import { Chip } from '@/shared/ui/Chip';
import { FavoriteButton } from '@/shared/ui/FavoriteButton';
import Button from '@/shared/ui/button';

/**
 * The car card, used by the catalogue, the home page, a seller's stock and the promoted
 * strip. `variant="rent"` is the same card with the day price and the rental terms —
 * one component, because a second one drifts.
 */
export default function AutoCard({ car, variant = 'sale' }) {
    const { t } = useTranslation('vehicle');
    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
    const isFav = useFavoritesStore((s) => s.isFavorited('vehicle', car?.id));

    if (!car) return null;

    const isRent = variant === 'rent';
    const mainImage = Array.isArray(car.image) ? car.image[0] : car.image;
    const title = [car.brand, car.model].filter(Boolean).join(' ');
    const meta = [
        formatYear(car.year),
        ...splitEngineSummary(car.engine),
        formatMileage(car.mileage),
        translateVehicleEnum(t, 'transmission', car.transmission),
    ].filter(Boolean);

    const rental = car.rental ?? null;
    const terms = isRent
        ? [
              rental?.minDays ? t('card.minDays', { count: rental.minDays }) : null,
              rental?.deposit
                  ? t('card.deposit', { amount: formatPrice(rental.deposit, car.currency || 'AZN') })
                  : t('card.noDeposit'),
              rental?.kmPerDay ? t('card.kmPerDay', { count: rental.kmPerDay }) : t('card.unlimitedKm'),
          ].filter(Boolean)
        : [];

    return (
        <CardWrapper as="article" hover className="relative flex h-full flex-col overflow-hidden [overflow-wrap:anywhere]">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-card-muted">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                ) : null}

                <div className="absolute left-3 right-14 top-3 flex flex-wrap items-center gap-1.5">
                    {car.promotionTier ? <PromotionBadge tier={car.promotionTier} /> : null}
                    {car.isHot ? <Badge variant="hot">{t('card.hot')}</Badge> : null}
                </div>

                <FavoriteButton
                    active={isFav}
                    label={isFav ? t('card.removeFromFavoritesAria') : t('card.addToFavoritesAria')}
                    onToggle={() =>
                        toggleFavorite({
                            type: 'vehicle',
                            id: car.id,
                            title,
                            thumbnail: mainImage,
                        })
                    }
                    className="absolute right-2 top-2 z-10"
                />
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-[20px] font-bold leading-none text-foreground">
                    {formatPrice(car.price, car.currency || 'AZN')}
                    {isRent ? (
                        <span className="ml-1 text-[13px] font-medium text-muted-foreground">
                            {t('card.perDay')}
                        </span>
                    ) : null}
                </p>

                <h3 className="text-[18px] font-semibold leading-snug text-foreground">
                    {/* Stretched link: the whole card opens the listing, the heart does not. */}
                    <Link to={`/vehicles/${car.id}`} className="after:absolute after:inset-0 after:content-['']">
                        {title}
                        {car.version ? (
                            <span className="inline-block max-w-full text-muted-foreground">
                                {' '}
                                — {car.version}
                            </span>
                        ) : null}
                    </Link>
                </h3>

                {meta.length > 0 ? (
                    <p className="text-[13px] text-muted-foreground">{meta.join(' · ')}</p>
                ) : null}

                {car.location ? (
                    <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                        <MapPin size={14} strokeWidth={1.5} aria-hidden="true" />
                        {car.location}
                    </p>
                ) : null}

                {isRent && terms.length > 0 ? (
                    <ul className="mt-1 flex list-none flex-wrap gap-1.5">
                        {terms.map((term) => (
                            <li key={term}>
                                <Chip>{term}</Chip>
                            </li>
                        ))}
                    </ul>
                ) : null}

                {isRent ? (
                    <>
                        <div className="flex-1" />
                        <Button asChild variant="secondary" className="relative z-10 mt-2 w-full">
                            <Link to={`/vehicles/${car.id}`}>{t('card.checkAvailability')}</Link>
                        </Button>
                    </>
                ) : null}
            </div>
        </CardWrapper>
    );
}
