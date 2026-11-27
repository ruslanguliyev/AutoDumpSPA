import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Badge } from '@/shared/ui/Badge';
import { FavoriteButton } from '@/shared/ui/FavoriteButton';
import { PromotionBadge } from '@/features/promotions/components/PromotionBadge';
import { useFavoritesStore } from '@/shared/store/favoritesStore';
import { formatPrice, intlLocale, listingFreshness } from '@/lib/format';
import { ListingPhoto } from '@/shared/ui/ListingImagePlaceholder';
import { formatPartCategoryLabel } from '@/parts/utils/partCategoryLabel';

/**
 * The part card, used by the parts catalogue, the home page and a seller's parts tab.
 *
 * It follows the catalogue car card so parts and cars read as one grid: a 4:3 photo,
 * then price, name, one spec line and a footer with the city and freshness.
 * Part photos are product shots on white, so the photo is contained on a white tile
 * rather than cropped. The category sits on the photo as a pill.
 */
export default function PartCard({ part }) {
    const { t, i18n } = useTranslation('part');
    const locale = intlLocale(i18n.language);
    const partId = part?.id ?? part?._id ?? part?.sku ?? part?.code ?? null;
    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
    const isFav = useFavoritesStore((s) => (partId == null ? false : s.isFavorited('part', partId)));

    if (!part) return null;

    const imageSrc = typeof part.imageUrl === 'string' && part.imageUrl.trim() ? part.imageUrl : null;
    const stock = Number.isFinite(part.stock) ? part.stock : null;
    const inStock = stock === null ? Boolean(part.inStock) : stock > 0;
    const price = Number.isFinite(part.price) ? part.price : null;
    const categoryLabel = formatPartCategoryLabel(t, part.category) || null;
    const fitment = [part.brand, part.model]
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
        .join(' ');

    const freshness = listingFreshness(part.bumpedAt ?? part.createdAt, locale);
    const when = !freshness
        ? ''
        : freshness.kind === 'date'
          ? freshness.date
          : t(freshness.kind === 'today' ? 'card.updatedToday' : 'card.updatedYesterday', {
                time: freshness.time,
            });
    const place = [String(part.location ?? part.seller?.city ?? '').trim(), when].filter(Boolean).join(', ');

    return (
        <CardWrapper as="article" hover className="group relative flex h-full min-w-0 flex-col overflow-hidden">
            <div
                className={`relative aspect-[4/3] w-full overflow-hidden ${imageSrc ? 'bg-white' : 'bg-card-muted'}`}
            >
                <ListingPhoto
                    src={imageSrc}
                    className={
                        imageSrc
                            ? 'h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105'
                            : 'h-full w-full object-cover'
                    }
                />

                {part.promotionTier ? (
                    <div className="absolute left-3 right-14 top-3 flex flex-wrap items-center gap-1.5">
                        <PromotionBadge tier={part.promotionTier} />
                    </div>
                ) : null}

                {categoryLabel ? (
                    <Badge variant="category" className="absolute bottom-2.5 left-3 max-w-[calc(100%-1.5rem)] shadow-sm">
                        <span className="min-w-0 truncate">{categoryLabel}</span>
                    </Badge>
                ) : null}

                {partId != null ? (
                    <FavoriteButton
                        size="sm"
                        active={isFav}
                        label={isFav ? t('card.removeFromFavorites') : t('card.addToFavorites')}
                        onToggle={() =>
                            toggleFavorite({
                                type: 'part',
                                id: partId,
                                title: part.name ?? '',
                                thumbnail: imageSrc,
                            })
                        }
                        className="absolute right-3 top-3 z-10 shadow-sm"
                    />
                ) : null}
            </div>

            <div className="flex flex-1 flex-col px-3.5 pb-3 pt-3">
                <p className="h-6 truncate text-[20px] font-bold leading-6 tracking-tight text-foreground tabular-nums">
                    {price !== null ? formatPrice(price, part.currency || 'AZN', locale) : ' '}
                </p>

                <h3 className="mt-1 text-[15px] font-semibold leading-5 text-foreground">
                    {/* Stretched link: the whole card opens the part, the heart does not. */}
                    {partId != null ? (
                        <Link
                            to={`/parts/${partId}`}
                            title={part.name}
                            className="block truncate transition-colors hover:text-primary after:absolute after:inset-0 after:content-['']"
                        >
                            {part.name}
                        </Link>
                    ) : (
                        <span className="block truncate">{part.name}</span>
                    )}
                </h3>

                <p className="mt-1 flex h-5 min-w-0 items-center gap-1.5 text-[13px] leading-5">
                    {inStock ? (
                        <span className="inline-flex shrink-0 items-center gap-1 font-medium text-success">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                            {stock === null ? t('card.stockInStockShort') : t('card.inStockCount', { count: stock })}
                        </span>
                    ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 font-medium text-destructive">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                            {t('card.stockOutOfStock')}
                        </span>
                    )}
                    {fitment ? (
                        <>
                            <span className="shrink-0 text-subtle-foreground" aria-hidden="true">
                                •
                            </span>
                            <span className="truncate text-muted-foreground">{fitment}</span>
                        </>
                    ) : null}
                </p>

                <div className="flex-1" />

                <p className="mt-3 h-7 truncate border-t border-border pt-2 text-[12px] leading-5 text-subtle-foreground">
                    {place || ' '}
                </p>
            </div>
        </CardWrapper>
    );
}
