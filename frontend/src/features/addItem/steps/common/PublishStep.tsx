import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import {
  validateBasics,
  validateDraft,
  validatePart,
  validatePhotos,
  validatePricing,
  validateSeller,
  validateVehicle,
} from '@/features/addItem/utils/validateDraft';

const PublishStep = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);

  const checks = useMemo(() => {
    if (!draft) return [];
    return [
      { labelKey: 'form.basicsComplete' as const, ok: validateBasics(draft) },
      {
        labelKey: (draft.type === 'vehicle' ? 'form.vehicleDetails' : 'form.partDetails') as const,
        ok: draft.type === 'vehicle' ? validateVehicle(draft) : validatePart(draft),
      },
      { labelKey: 'form.pricingSet' as const, ok: validatePricing(draft) },
      { labelKey: 'form.sellerDetails' as const, ok: validateSeller(draft) },
      { labelKey: 'form.photosUploaded' as const, ok: validatePhotos(draft) },
    ];
  }, [draft]);

  if (!draft) return null;
  const ready = validateDraft(draft);

  const statusRow = (labelKey: string, ok: boolean) => (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
      <span>{t(labelKey)}</span>
      <span className={ok ? 'text-success' : 'text-muted-foreground'}>
        {ok ? t('form.ready') : t('form.missing')}
      </span>
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('form.publishChecklistTitle')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('form.publishChecklistHint')}
        </p>
      </div>

      <div className="space-y-3">
        {checks.map((item) => (
          <div key={item.labelKey}>{statusRow(item.labelKey, item.ok)}</div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm">
        {ready ? (
          <span className="text-success">
            {t('form.allCompleteMessage')}
          </span>
        ) : (
          <span className="text-muted-foreground">
            {t('form.completeMissingMessage')}
          </span>
        )}
      </div>
    </div>
  );
};

export default PublishStep;
