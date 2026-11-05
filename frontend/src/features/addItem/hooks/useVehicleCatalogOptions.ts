import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ListingVehicle } from '@/features/addItem/store/useAddItemStore';
import {
  getModelsForBrand,
  getTrimOptionsForVehicle,
  normalizeBrandKey,
  VEHICLE_MODEL_OTHER_VALUE,
} from '@/features/addItem/constants/vehicleCatalog';
import type { ComboboxOption } from '@/shared/ui/Combobox';

export function useVehicleCatalogOptions(vehicle: ListingVehicle | undefined) {
  const { t, i18n } = useTranslation('addItem');

  const brandKey = useMemo(() => normalizeBrandKey(vehicle?.brand), [vehicle?.brand]);

  const modelValues = useMemo(() => getModelsForBrand(brandKey), [brandKey]);

  const modelOptions: ComboboxOption[] = useMemo(
    () =>
      modelValues.map((value) => ({
        value,
        label:
          value === VEHICLE_MODEL_OTHER_VALUE
            ? t('form.modelOther')
            : value,
      })),
    [modelValues, i18n.resolvedLanguage]
  );

  const trimValues = useMemo(
    () => getTrimOptionsForVehicle(brandKey, vehicle?.model ?? ''),
    [brandKey, vehicle?.model]
  );

  const trimOptions: ComboboxOption[] = useMemo(
    () => trimValues.map((value) => ({ value, label: value })),
    [trimValues]
  );

  return {
    brandKey,
    modelOptions,
    trimOptions,
    hasBrand: Boolean(brandKey),
    hasModelForTrims: Boolean(
      brandKey && String(vehicle?.model ?? '').trim() && vehicle?.model !== VEHICLE_MODEL_OTHER_VALUE
    ),
    modelDisabled: !brandKey,
    trimDisabled: !brandKey || !String(vehicle?.model ?? '').trim() || vehicle?.model === VEHICLE_MODEL_OTHER_VALUE,
  };
}
