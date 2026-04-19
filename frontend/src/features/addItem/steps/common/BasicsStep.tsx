import { useTranslation } from 'react-i18next';

import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import { getDraftTitle } from '@/features/addItem/utils/validateDraft';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const BasicsStep = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setCommonField = useAddItemStore((state) => state.setCommonField);

  if (!draft) return null;
  const autoTitle = getDraftTitle({ ...draft, common: { ...draft.common, titleMode: 'auto' } });

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('form.listingBasics')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('form.listingBasicsHint')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              draft.common.titleMode === 'auto'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
            onClick={() => setCommonField('titleMode', 'auto')}
          >
            {t('form.autoTitle')}
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              draft.common.titleMode === 'manual'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
            onClick={() => setCommonField('titleMode', 'manual')}
          >
            {t('form.manualTitle')}
          </button>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.title')}
          </label>
          <input
            className={inputClass}
            placeholder={autoTitle}
            value={draft.common.titleMode === 'manual' ? draft.common.title : autoTitle}
            onChange={(event) => setCommonField('title', event.target.value)}
            disabled={draft.common.titleMode === 'auto'}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.category')}
          </label>
          <input
            className={inputClass}
            placeholder={draft.type === 'vehicle' ? t('form.categoryPlaceholderVehicle') : t('form.categoryPlaceholderPart')}
            value={draft.common.category}
            onChange={(event) => setCommonField('category', event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.condition')}
          </label>
          <select
            className={inputClass}
            value={draft.common.condition}
            onChange={(event) =>
              setCommonField('condition', event.target.value as typeof draft.common.condition)
            }
          >
            <option value="new">{t('form.conditionNew')}</option>
            <option value="used">{t('form.conditionUsed')}</option>
            <option value="certified">{t('form.conditionCertified')}</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t('form.description')}
          </label>
          <textarea
            className={`${inputClass} min-h-[120px]`}
            placeholder={t('form.descriptionPlaceholder')}
            value={draft.common.description}
            onChange={(event) => setCommonField('description', event.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicsStep;
