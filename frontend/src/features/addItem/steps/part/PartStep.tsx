import { useTranslation } from 'react-i18next';

import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const PartStep = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setPartField = useAddItemStore((state) => state.setPartField);

  if (!draft?.part) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('form.partDetailsTitle')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('form.partDetailsHint')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.partName')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.partNamePlaceholder')}
            value={draft.part.name}
            onChange={(event) => setPartField('name', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.brand')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.partBrandPlaceholder')}
            value={draft.part.brand}
            onChange={(event) => setPartField('brand', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.partNumber')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.partNumberPlaceholder')}
            value={draft.part.partNumber}
            onChange={(event) => setPartField('partNumber', event.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.condition')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.partConditionPlaceholder')}
            value={draft.part.condition}
            onChange={(event) => setPartField('condition', event.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.compatibility')}
          </label>
          <input
            className={inputClass}
            placeholder={t('form.compatibilityPlaceholder')}
            value={draft.part.compatibility}
            onChange={(event) => setPartField('compatibility', event.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PartStep;
