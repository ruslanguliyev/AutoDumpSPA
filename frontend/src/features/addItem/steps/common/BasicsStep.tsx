import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  isVehicleCategoryId,
  VEHICLE_CATEGORY_IDS,
} from '@/features/addItem/constants/vehicleCatalog';
import { useAddItemStore } from '@/features/addItem/store/useAddItemStore';
import { Select } from '@/shared/ui/Select';
import { DescriptionAi } from '@/features/addItem/ai/DescriptionAi';
import { DESCRIPTION_MAX_LENGTH } from '@/features/addItem/utils/validateDraft';
import { useAiEnabled } from '@/features/ai/ai.api';
import { PartPhotoAi } from '@/features/addItem/ai/PartPhotoAi';
import { formatPartCategoryLabel } from '@/parts/utils/partCategoryLabel';
import { getPartCategoryKey, PART_CATEGORIES } from '@/parts/utils/parts.constants';

const controlClass =
  'w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const inputClass = `${controlClass} bg-background`;

const BasicsStep = () => {
  const { t } = useTranslation('addItem');
  const { t: tPart } = useTranslation('part');
  const aiOn = useAiEnabled();
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

  const partCategoryOptions = useMemo(
    () =>
      PART_CATEGORIES.map((category: { value: string }) => ({
        value: category.value,
        label: formatPartCategoryLabel(tPart, category.value) || category.value,
      })),
    [tPart]
  );

  if (!draft) return null;

  const rawCategory = String(draft.common.category ?? '').trim();
  const categoryError =
    draft.type === 'vehicle' && rawCategory !== '' && !isVehicleCategoryId(rawCategory)
      ? t('validation.invalidVehicleCategory')
      : undefined;

  const vehicleCategoryValue =
    draft.type === 'vehicle' && isVehicleCategoryId(rawCategory) ? rawCategory : '';
  // Parts saved before the list existed may carry free text or "Brakes"; only list values show.
  const partCategoryValue = draft.type === 'part' ? (getPartCategoryKey(rawCategory) ?? '') : '';

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t('form.listingBasics')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('form.listingBasicsHint')}
        </p>
      </div>

      <div className="space-y-4">
        {draft.type === 'part' && aiOn ? <PartPhotoAi /> : null}

        <div>
          {draft.type === 'vehicle' ? (
            <Select
              id="add-item-category"
              label={t('form.category')}
              value={vehicleCategoryValue}
              onChange={(event) => setCommonField('category', event.target.value)}
              options={vehicleCategoryOptions}
              placeholder={t('form.categoryPlaceholderVehicle')}
              error={categoryError}
            />
          ) : (
            <Select
              id="add-item-category"
              label={t('form.category')}
              value={partCategoryValue}
              onChange={(event) => setCommonField('category', event.target.value)}
              options={partCategoryOptions}
              placeholder={t('form.categoryPlaceholderPartSelect')}
            />
          )}
        </div>

        <div>
          <label
            htmlFor="add-item-condition"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            {t('form.condition')}
          </label>
          <select
            id="add-item-condition"
            className={inputClass}
            value={draft.common.condition}
            onChange={(event) =>
              setCommonField('condition', event.target.value as typeof draft.common.condition)
            }
          >
            <option value="new">{t('form.conditionNew')}</option>
            <option value="used">{t('form.conditionUsed')}</option>
            {draft.type === 'vehicle' ? (
              <option value="certified">{t('form.conditionCertified')}</option>
            ) : null}
          </select>
        </div>

        {draft.type === 'vehicle' && aiOn ? (
          <DescriptionAi />
        ) : (
          <div>
            <label htmlFor="listing-description" className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t('form.description')}
            </label>
            <textarea
              id="listing-description"
              className={`${controlClass} min-h-[120px] bg-transparent`}
              placeholder={t('form.descriptionPlaceholder')}
              maxLength={DESCRIPTION_MAX_LENGTH}
              value={draft.common.description ?? ''}
              onChange={(event) => setCommonField('description', event.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicsStep;
