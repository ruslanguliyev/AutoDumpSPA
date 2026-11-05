import { useTranslation } from 'react-i18next';

import { isVehicleCategoryId } from '@/features/addItem/constants/vehicleCatalog';
import type { ListingDraft } from '@/features/addItem/store/useAddItemStore';
import { getDraftTitle } from '@/features/addItem/utils/validateDraft';
import { formatNumber } from '@/lib/format';
import { resolveMediaUrl } from '@/lib/mediaUrl';
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
    return `${currency} ${formatNumber(price, 'en-US')}`;
  }
};

const PreviewCard = ({ draft }: PreviewCardProps) => {
  const { t } = useTranslation('addItem');
  const primaryPhoto =
    draft.media.images.find((image) => image.isMain) ?? draft.media.images[0];
  const primaryPhotoUrl = resolveMediaUrl(primaryPhoto?.url);
  const title = getDraftTitle(draft);
  const price = formatPrice(draft.common.pricing.price, draft.common.pricing.currency);
  const statusKey =
    draft.status === 'published'
      ? 'preview.statusPublished'
      : draft.status === 'ready'
        ? 'preview.statusReady'
        : 'preview.statusDraft';

  const categoryLabel =
    draft.type === 'vehicle' &&
    isVehicleCategoryId(String(draft.common.category ?? '').trim())
      ? t(`form.vehicleCategories.${String(draft.common.category).trim()}`)
      : '';

  // Only show vehicle details once the user has started filling the Vehicle step
  // (brand is explicitly set). Avoids leaking create-draft defaults like "2020".
  const vehicleMeta =
    draft.type === 'vehicle' && draft.vehicle && String(draft.vehicle.brand ?? '').trim()
      ? [
          draft.vehicle.brand,
          draft.vehicle.model,
          draft.vehicle.trim,
          draft.vehicle.year,
          draft.vehicle.displacement
            ? `${String(draft.vehicle.displacement).trim()}L`
            : '',
          draft.vehicle.horsepower
            ? `${String(draft.vehicle.horsepower).trim()} HP`
            : '',
        ]
          .map((x) => String(x ?? '').trim())
          .filter(Boolean)
          .join(' · ')
      : '';

  const previewSubtitle = [categoryLabel, vehicleMeta].filter(Boolean).join(' · ');

  const conditionLabel =
    draft.common.condition === 'new'
      ? t('form.conditionNew')
      : draft.common.condition === 'used'
        ? t('form.conditionUsed')
        : draft.common.condition === 'certified'
          ? t('form.conditionCertified')
          : draft.common.condition;

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
        {primaryPhotoUrl ? (
          <img
            src={primaryPhotoUrl}
            alt={title}
            className="h-44 w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
            {t('preview.noPhotosYet')}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-lg font-semibold text-foreground">{title}</div>
        {previewSubtitle ? (
          <div className="text-sm text-muted-foreground">{previewSubtitle}</div>
        ) : null}
        <div className="text-sm text-muted-foreground">
          {draft.type === 'vehicle' ? t('preview.vehicleListing') : t('preview.partListing')}
        </div>
        <div className="text-2xl font-semibold text-primary">{price}</div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {draft.common.condition && (
            <span className="rounded-full bg-muted px-2 py-1">
              {conditionLabel}
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
