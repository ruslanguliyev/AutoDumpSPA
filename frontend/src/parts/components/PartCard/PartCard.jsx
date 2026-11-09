import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Badge } from '@/shared/ui/Badge';
import { PromotionBadge } from '@/features/promotions/components/PromotionBadge';
import { formatPrice } from '@/lib/format';
import { getPartCategoryI18nKey } from '@/parts/utils/partCategoryLabel';

/** The part card, used by the parts catalogue, the home page and a seller's parts tab. */
export default function PartCard({ part }) {
    const { t } = useTranslation('part');

    if (!part) return null;

    const partId = part.id ?? part._id ?? part.sku ?? part.code ?? null;
    const imageSrc = part.imageUrl || null;
    // The parts API carries no rating or review count today, so these are only there for
    // mock data and, later, a real field. A "0.0 (0 reviews)" drawn on every real part
    // would be an invented number, so the stars appear only when a rating was supplied.
    const hasRating = Number.isFinite(part.rating);
    const reviewsCount = Number.isFinite(part.reviewsCount) ? part.reviewsCount : 0;
    const stock = Number.isFinite(part.stock) ? part.stock : null;
    const inStock = stock === null ? Boolean(part.inStock) : stock > 0;
    const price = Number.isFinite(part.price) ? part.price : null;
    const categoryKey = part.category ? getPartCategoryI18nKey(part.category) : null;
    const categoryLabel =
        part.category && categoryKey
            ? t(`categories.${categoryKey}`, { defaultValue: part.category })
            : part.category
              ? t(`categories.${String(part.category).trim().toLowerCase()}`, { defaultValue: part.category })
              : null;

    return (
        <CardWrapper as="article" hover className="relative flex h-full flex-col overflow-hidden [overflow-wrap:anywhere]">
            <div className="aspect-square w-full overflow-hidden bg-card-muted">
                {imageSrc ? (
                    <img src={imageSrc} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                    {part.promotionTier ? <PromotionBadge tier={part.promotionTier} /> : null}
                    {categoryLabel ? <Badge variant="category">{categoryLabel}</Badge> : null}
                </div>

                <h3 className="text-[16px] font-semibold leading-snug text-foreground">
                    {partId ? (
                        <Link to={`/parts/${partId}`} className="after:absolute after:inset-0 after:content-['']">
                            {part.name}
                        </Link>
                    ) : (
                        part.name
                    )}
                </h3>

                {hasRating ? (
                    <RatingStars value={part.rating} countLabel={t('card.reviews', { count: reviewsCount })} />
                ) : null}

                {inStock ? (
                    <Badge variant="inStock">
                        {stock === null ? t('card.stockInStockShort') : t('card.inStockCount', { count: stock })}
                    </Badge>
                ) : (
                    <Badge variant="outOfStock">{t('card.stockOutOfStock')}</Badge>
                )}

                <div className="flex-1" />

                {price !== null ? (
                    <p className="text-[20px] font-bold leading-none text-foreground">
                        {formatPrice(price, part.currency || 'AZN')}
                    </p>
                ) : null}
            </div>
        </CardWrapper>
    );
}
