import { useTranslation } from 'react-i18next';

import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const PricingStep = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setPricingField = useAddItemStore((state) => state.setPricingField);

  if (!draft) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('form.pricingTitle')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('form.pricingHint')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.price')}
          </label>
          <input
            className={inputClass}
            type="number"
            min="0"
            placeholder="0"
            value={draft.common.pricing.price ?? ''}
            onChange={(event) =>
              setPricingField(
                'price',
                event.target.value === '' ? null : Number(event.target.value)
              )
            }
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.currency')}
          </label>
          <select
            className={inputClass}
            value={draft.common.pricing.currency}
            onChange={(event) => setPricingField('currency', event.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-3 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={draft.common.pricing.negotiable}
            onChange={(event) => setPricingField('negotiable', event.target.checked)}
          />
          {t('form.negotiablePricing')}
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-3 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={draft.common.pricing.vatIncluded}
            onChange={(event) => setPricingField('vatIncluded', event.target.checked)}
          />
          {t('form.vatIncluded')}
        </label>
      </div>
    </div>
  );
};

export default PricingStep;
