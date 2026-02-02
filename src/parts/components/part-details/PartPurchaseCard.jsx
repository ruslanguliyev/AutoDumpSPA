import { Check, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SellerCard, TrustBlock } from '@/shared/blocks';

export const PartPurchaseCard = ({ part, isFavorited, onToggleFavorite }) => {
  const { t } = useTranslation('part');
  const inStock = (part?.stock ?? 0) > 0;
  const priceLabel =
    part?.price != null ? `${Number(part.price).toFixed(2)} ${part?.currency ?? ''}` : '—';

  // Translate condition value
  const getConditionLabel = (condition) => {
    if (!condition) return '—';
    const lower = condition.toLowerCase();
    if (lower === 'new') return t('filter.new');
    if (lower === 'used') return t('filter.used');
    if (lower === 'refurbished') return t('filter.refurbished');
    return condition; // Fallback to original if unknown
  };

  const onFav = () => {
    if (!part) return;
    onToggleFavorite?.();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)] lg:sticky lg:top-[157px]">
      <div className="space-y-4">
        {/* 1) Price block */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-center text-2xl font-black tracking-tight text-foreground">
              {priceLabel}
            </div>
            <div className="mt-1 text-center text-xs font-semibold text-success">
              {inStock ? t('purchase.inStockCount', { count: part.stock }) : t('details.outOfStock')}
            </div>
          </div>

          {/* 5) Favorites (secondary) */}
          <button
            type="button"
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-50',
              isFavorited
                ? 'bg-primary/10 text-primary'
                : 'bg-transparent',
            ].join(' ')}
            aria-label={isFavorited ? t('card.removeFromFavorites') : t('card.addToFavorites')}
            aria-pressed={Boolean(isFavorited)}
            onClick={onFav}
            disabled={!part?.id}
          >
            <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* 2) Listing info (classifieds-style) */}
        <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
          <div className="text-center text-[11px] font-extrabold tracking-wide text-muted-foreground">
            {t('purchase.listingInfo')}
          </div>
          <div className="mt-3 space-y-2 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <span>{t('details.condition')}</span>
              <span className="text-foreground">{getConditionLabel(part?.condition)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>{t('details.location')}</span>
              <span className="text-foreground">{part?.location || '—'}</span>
            </div>
          </div>
        </div>

        {/* 4) Trust signals */}
        <div className="flex items-center justify-center gap-6 border-b border-border pb-3 text-[11px] font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Check size={14} className="text-success" aria-hidden="true" />
            {t('purchase.freeReturns')}
          </span>
          <span className="inline-flex items-center gap-2">
            <Check size={14} className="text-success" aria-hidden="true" />
            {t('purchase.secureCheckout')}
          </span>
        </div>

        {/* 5) Seller card */}
        <SellerCard seller={part?.seller} variant="compact" />

        {/* 6) Protection / guarantees */}
        <TrustBlock variant="part" />
      </div>
    </div>
  );
};
