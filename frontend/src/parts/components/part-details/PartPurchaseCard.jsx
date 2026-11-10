import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatPrice, intlLocale } from '@/lib/format';
import Button from '@/shared/ui/button';
import { Badge } from '@/shared/ui/Badge';

export const PartPurchaseCard = ({ part, isFavorited, onToggleFavorite }) => {
  const { t, i18n } = useTranslation('part');
  const locale = intlLocale(i18n.language);
  const inStock = (part?.stock ?? 0) > 0;

  const getConditionLabel = (condition) => {
    if (!condition) return '—';
    const lower = String(condition).toLowerCase();
    if (lower === 'new') return t('filter.new');
    if (lower === 'used') return t('filter.used');
    if (lower === 'refurbished') return t('filter.refurbished');
    return condition;
  };

  const onFav = () => {
    if (!part?.id) return;
    onToggleFavorite?.();
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] [overflow-wrap:anywhere]">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[28px] font-bold leading-none text-primary-text">
              {formatPrice(part?.price, part?.currency ?? 'AZN', locale)}
            </p>
            <p className="mt-2">
              {inStock ? (
                <Badge variant="inStock">{t('purchase.inStockCount', { count: part.stock })}</Badge>
              ) : (
                <Badge variant="outOfStock">{t('details.outOfStock')}</Badge>
              )}
            </p>
          </div>

          <Button
            type="button"
            variant="icon"
            size="icon"
            className="shrink-0"
            aria-label={isFavorited ? t('card.removeFromFavorites') : t('card.addToFavorites')}
            aria-pressed={Boolean(isFavorited)}
            onClick={onFav}
            disabled={!part?.id}
          >
            <Heart size={20} strokeWidth={1.5} fill={isFavorited ? 'currentColor' : 'none'} aria-hidden="true" />
          </Button>
        </div>

        <Button asChild variant="primary" className="w-full min-h-11 justify-center">
          <a href="#contact-seller">{t('purchase.contactSeller')}</a>
        </Button>

        <div className="rounded-[var(--radius)] border border-dashed border-border-strong px-3 py-2 dark:border-border">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {t('purchase.listingInfo')}
          </p>
          <dl className="mt-3 space-y-2 text-[13px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{t('details.condition')}</dt>
              <dd className="font-semibold text-foreground">{getConditionLabel(part?.condition)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">{t('details.location')}</dt>
              <dd className="font-semibold text-foreground">{part?.location?.trim() || '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
};
