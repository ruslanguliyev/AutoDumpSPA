import { useTranslation } from 'react-i18next';

import type { ListingDraft } from '@/features/addItem/store/useAddItemStore';
import { getDraftTitle } from '@/features/addItem/utils/validateDraft';
import { cn } from '@/shared/utils/cn';

type PreviewCardProps = {
  draft: ListingDraft;
};

const formatPrice = (price: number | null, currency: string) => {
  if (!price || !Number.isFinite(price)) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  } catch (_error) {
    return `${currency} ${price.toLocaleString()}`;
  }
};

const PreviewCard = ({ draft }: PreviewCardProps) => {
  const { t } = useTranslation('addItem');
  const mainImage =
    draft.media.images.find((image) => image.isMain) ?? draft.media.images[0];
  const rawTitle = getDraftTitle(draft);
  const title =
    rawTitle === 'Untitled listing'
      ? t('untitled.listing')
      : rawTitle === 'Untitled vehicle'
        ? t('untitled.vehicle')
        : rawTitle === 'Untitled part'
          ? t('untitled.part')
          : rawTitle;
  const price = formatPrice(draft.common.pricing.price, draft.common.pricing.currency);
  const statusKey =
    draft.status === 'published'
      ? 'preview.statusPublished'
      : draft.status === 'ready'
        ? 'preview.statusReady'
        : 'preview.statusDraft';

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)]">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span>{t('preview.livePreview')}</span>
        <span
          className={cn(
            'rounded-full px-2 py-1 text-[10px]',
            draft.status === 'published'
              ? 'bg-success/15 text-success'
              : draft.status === 'ready'
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
          )}
        >
          {t(statusKey)}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-muted">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={title}
            className="h-44 w-full object-cover"
          />
        ) : (
          <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
            {t('preview.noPhotosYet')}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-lg font-semibold text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground">
          {draft.type === 'vehicle' ? t('preview.vehicleListing') : t('preview.partListing')}
        </div>
        <div className="text-2xl font-semibold text-primary">{price}</div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {draft.common.condition && (
            <span className="rounded-full bg-muted px-2 py-1">
              {draft.common.condition}
            </span>
          )}
          {draft.seller.location && (
            <span className="rounded-full bg-muted px-2 py-1">
              {draft.seller.location}
            </span>
          )}
          {draft.common.pricing.negotiable && (
            <span className="rounded-full bg-muted px-2 py-1">{t('preview.negotiable')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;
