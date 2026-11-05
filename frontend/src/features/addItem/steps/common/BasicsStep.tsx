import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  isVehicleCategoryId,
  VEHICLE_CATEGORY_IDS,
} from '@/features/addItem/constants/vehicleCatalog';
import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import { FormNativeSelect } from '@/shared/ui/FormNativeSelect';

const controlClass =
  'w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const inputClass = `${controlClass} bg-background`;

const BasicsStep = () => {
  const { t } = useTranslation('addItem');
  const draft = useAddItemStore((state) => state.draft);
  const setCommonField = useAddItemStore((state) => state.setCommonField);

  useEffect(() => {
    if (draft?.type !== 'vehicle') return;
    const c = String(draft.common.category ?? '').trim();
    if (c && !isVehicleCategoryId(c)) {
      setCommonField('category', '');
    }
  }, [draft?.id, draft?.type, draft?.common.category, setCommonField]);

  const vehicleCategoryOptions = useMemo(
    () =>
      VEHICLE_CATEGORY_IDS.map((id) => ({
        value: id,
        label: t(`form.vehicleCategories.${id}`),
      })),
    [t]
  );

  if (!draft) return null;

  const rawCategory = String(draft.common.category ?? '').trim();
  const categoryError =
    draft.type === 'vehicle' && rawCategory !== '' && !isVehicleCategoryId(rawCategory)
      ? t('validation.invalidVehicleCategory')
      : undefined;

  const vehicleCategoryValue =
    draft.type === 'vehicle' && isVehicleCategoryId(rawCategory) ? rawCategory : '';

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('form.listingBasics')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('form.listingBasicsHint')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            htmlFor="add-item-category"
          >
            {t('form.category')}
          </label>
          {draft.type === 'vehicle' ? (
            <FormNativeSelect
              id="add-item-category"
              value={vehicleCategoryValue}
              onChange={(v) => setCommonField('category', v)}
              options={vehicleCategoryOptions}
              placeholder={t('form.categoryPlaceholderVehicle')}
              error={categoryError}
              aria-label={t('form.category')}
            />
          ) : (
            <input
              id="add-item-category"
              className={inputClass}
              placeholder={t('form.categoryPlaceholderPart')}
              value={draft.common.category}
              onChange={(event) => setCommonField('category', event.target.value)}
            />
          )}
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
            className={`${controlClass} min-h-[120px] bg-transparent`}
            placeholder={t('form.descriptionPlaceholder')}
            value={draft.common.description ?? ''}
            onChange={(event) => setCommonField('description', event.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicsStep;
