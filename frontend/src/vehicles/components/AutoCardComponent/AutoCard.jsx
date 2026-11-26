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
function CatalogAutoCard({ car, variant = 'sale' }) {
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

/** Space as the thousands separator, as on the seller-stock reference (“184 000”). */
const groupWithSpace = (value) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
        .format(Number(value))
        .replace(/[\u202F\u00A0]/g, ' ');

/** Comma as the thousands separator, as on the seller-stock reference (“28,400 km”). */
const groupWithComma = (value) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(value));

/**
 * Seller stock card. Catalogue cards keep their own formatter and the city line;
 * this layout only changes what the dealer page draws.
 */
function SellerStockCard({ car, variant = 'sale' }) {
    const { t, i18n } = useTranslation('vehicle');
    const locale = intlLocale(i18n.language);
    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
    const isFav = useFavoritesStore((s) => s.isFavorited('vehicle', car?.id));

    if (!car) return null;

    const isRent = variant === 'rent';
    const units = String(locale).startsWith('ru')
        ? { km: 'км', hp: 'л.с.', liter: 'л' }
        : { km: 'km', hp: 'HP', liter: 'L' };
    const mainImage = Array.isArray(car.image) ? car.image[0] : car.image;
    const baseTitle = [car.brand, car.model].filter(Boolean).join(' ');
    const version = typeof car.version === 'string' ? car.version.trim() : '';
    const title = version ? `${baseTitle} — ${version}` : baseTitle;

    const engine = Number(car.engineVolume);
    const power = Number(car.power);
    const mileage = Number(car.mileage);
    const specs = [
        car.year ? String(car.year) : null,
        Number.isFinite(engine) && engine > 0
            ? `${new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
              }).format(engine)}${units.liter}`
            : null,
        Number.isFinite(power) && power > 0 ? `${groupWithComma(power)} ${units.hp}` : null,
        Number.isFinite(mileage) ? `${groupWithComma(mileage)} ${units.km}` : null,
    ]
        .filter(Boolean)
        .join(' · ');

    const priceLabel =
        car.price == null || !Number.isFinite(Number(car.price))
            ? '—'
            : `${groupWithSpace(Number(car.price))} ${car.currency || 'AZN'}`;

    const rental = car.rental ?? null;
    const terms = isRent
        ? [
              rental?.minDays ? t('card.minDays', { count: rental.minDays }) : null,
              rental?.deposit
                  ? t('card.deposit', {
                        amount: `${groupWithSpace(Number(rental.deposit))} ${car.currency || 'AZN'}`,
                    })
                  : null,
              rental?.kmPerDay ? t('card.kmPerDay', { count: rental.kmPerDay }) : null,
          ].filter(Boolean)
        : [];

    return (
        <CardWrapper as="article" hover className="relative flex h-full min-w-0 flex-col overflow-hidden">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-card-muted">
                <ListingPhoto src={mainImage} className="h-full w-full object-cover" />

                <div className="absolute left-3 right-12 top-3 flex flex-wrap items-center gap-1.5">
                    {car.promotionTier ? <PromotionBadge tier={car.promotionTier} /> : null}
                    {isRent ? <Badge variant="ad">{t('card.rent')}</Badge> : null}
                    {car.isHot ? <Badge variant="hot">{t('card.hot')}</Badge> : null}
                </div>

                <FavoriteButton
                    size="sm"
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
                    className="absolute right-3 top-3 z-10"
                />
            </div>

            <div className="flex flex-1 flex-col gap-1 p-4">
                <p className="flex items-baseline gap-1 overflow-hidden text-foreground">
                    <span className="truncate text-[20px] font-bold leading-6 tabular-nums">{priceLabel}</span>
                    {isRent ? (
                        <span className="shrink-0 text-[13px] font-medium leading-6 text-muted-foreground">
                            {t('card.perDay')}
                        </span>
                    ) : null}
                </p>

                <h3 className="text-[16px] font-semibold leading-6 text-foreground">
                    <Link
                        to={`/vehicles/${car.id}`}
                        className="block truncate after:absolute after:inset-0 after:content-['']"
                    >
                        {title}
                    </Link>
                </h3>

                <p className="truncate text-[13px] leading-5 text-muted-foreground">{specs || '\u00a0'}</p>

                {terms.length > 0 ? (
                    <ul className="mt-1 flex list-none flex-wrap items-center gap-1.5">
                        {terms.map((term) => (
                            <li key={term}>
                                <Chip>{term}</Chip>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </CardWrapper>
    );
}

export default function AutoCard({ car, variant = 'sale', layout = 'catalog' }) {
    if (layout === 'seller') return <SellerStockCard car={car} variant={variant} />;
    return <CatalogAutoCard car={car} variant={variant} />;
}
