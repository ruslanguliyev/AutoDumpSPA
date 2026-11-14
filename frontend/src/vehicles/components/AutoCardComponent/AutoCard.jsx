import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useFavoritesStore } from '@/shared/store/favoritesStore';
import {
    formatCardEngine,
    formatMileage,
    formatPrice,
    intlLocale,
    listingFreshness,
} from '@/lib/format';
import { ListingPhoto } from '@/shared/ui/ListingImagePlaceholder';
import { PromotionBadge } from '@/features/promotions/components/PromotionBadge';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Badge } from '@/shared/ui/Badge';
import { Chip } from '@/shared/ui/Chip';
import { FavoriteButton } from '@/shared/ui/FavoriteButton';
import Button from '@/shared/ui/button';

/**
 * Catalogue card in the turbo.az rhythm: four single lines under the photo.
 * Price, brand + model, year / engine / mileage, then city and freshness.
 * Trim, horsepower and gearbox stay on the detail page so nothing wraps
 * and neighbouring cards stay the same height.
 */
export default function AutoCard({ car, variant = 'sale' }) {
    const { t, i18n } = useTranslation('vehicle');
    const locale = intlLocale(i18n.language);
    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
    const isFav = useFavoritesStore((s) => s.isFavorited('vehicle', car?.id));

    if (!car) return null;

    const isRent = variant === 'rent';
    const mainImage = Array.isArray(car.image) ? car.image[0] : car.image;
    const title = [car.brand, car.model].filter(Boolean).join(' ');
    const specs = [
        car.year ? String(car.year) : null,
        formatCardEngine(car.engineVolume, locale),
        car.mileage != null && Number.isFinite(Number(car.mileage))
            ? formatMileage(car.mileage, locale)
            : null,
    ]
        .filter(Boolean)
        .join(', ');

    const freshness = listingFreshness(car.bumpedAt, locale);
    const when = !freshness
        ? ''
        : freshness.kind === 'date'
          ? freshness.date
          : t(freshness.kind === 'today' ? 'card.updatedToday' : 'card.updatedYesterday', {
                time: freshness.time,
            });
    const place = [String(car.location ?? '').trim(), when].filter(Boolean).join(', ');

    const rental = car.rental ?? null;
    const terms = isRent
        ? [
              rental?.minDays ? t('card.minDays', { count: rental.minDays }) : null,
              rental?.deposit
                  ? t('card.deposit', { amount: formatPrice(rental.deposit, car.currency || 'AZN', locale) })
                  : t('card.noDeposit'),
              rental?.kmPerDay ? t('card.kmPerDay', { count: rental.kmPerDay }) : t('card.unlimitedKm'),
          ].filter(Boolean)
        : [];

    return (
        <CardWrapper as="article" hover className="relative flex h-full flex-col overflow-hidden">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-card-muted">
                <ListingPhoto src={mainImage} className="h-full w-full object-cover" />

                <div className="absolute left-3 right-14 top-3 flex flex-wrap items-center gap-1.5">
                    {car.promotionTier ? <PromotionBadge tier={car.promotionTier} /> : null}
                    {isRent ? <Badge variant="ad">{t('card.rent')}</Badge> : null}
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

            <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
                <p className="flex h-6 items-baseline gap-1 overflow-hidden text-foreground">
                    <span className="truncate text-[17px] font-bold leading-6">
                        {formatPrice(car.price, car.currency || 'AZN', locale)}
                    </span>
                    {isRent ? (
                        <span className="shrink-0 text-[13px] font-medium leading-6 text-muted-foreground">
                            {t('card.perDay')}
                        </span>
                    ) : null}
                </p>

                <h3 className="mt-0.5 text-[15px] font-bold leading-5 text-foreground">
                    {/* Stretched link: the whole card opens the listing, the heart does not. */}
                    <Link
                        to={`/vehicles/${car.id}`}
                        className="block truncate after:absolute after:inset-0 after:content-['']"
                    >
                        {title}
                    </Link>
                </h3>

                <p className="mt-0.5 h-5 truncate text-[13px] leading-5 text-muted-foreground">
                    {specs || '\u00a0'}
                </p>
                <p className="h-5 truncate text-[13px] leading-5 text-subtle-foreground">
                    {place || '\u00a0'}
                </p>

                {isRent && terms.length > 0 ? (
                    <ul className="mt-2 flex list-none flex-wrap gap-1.5">
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
