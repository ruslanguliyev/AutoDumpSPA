import type { ListingDraft } from '@/features/addItem/store/useAddItemStore';
import {
  isModelAllowedForBrand,
  isTrimAllowedForVehicle,
  isVehicleCategoryId,
} from '@/features/addItem/constants/vehicleCatalog';

const trim = (value: string | undefined | null) => String(value ?? '').trim();

const buildVehicleTitle = (draft: ListingDraft) => {
  const vehicle = draft.vehicle;
  if (!vehicle) return '';
  const brand = trim(vehicle.brand);
  const model = trim(vehicle.model);
  return [brand, model].filter(Boolean).join(' ');
};

const buildPartTitle = (draft: ListingDraft) => {
  const part = draft.part;
  if (!part) return '';
  return [part.brand, part.name, part.partNumber]
    .map((value) => trim(value))
    .filter(Boolean)
    .join(' ');
};

/** Display / listing title derived only from vehicle or part fields (not `common.title`). */
export const getDraftTitle = (draft: ListingDraft) => {
  return draft.type === 'vehicle' ? buildVehicleTitle(draft) : buildPartTitle(draft);
};

export const validateVehicleCategory = (draft: ListingDraft) => {
  if (draft.type !== 'vehicle') return true;
  // The category is not stored on the server, so it cannot be required when editing.
  if (draft._editing && !trim(draft.common.category)) return true;
  return isVehicleCategoryId(trim(draft.common.category));
};

export const validateBasics = (draft: ListingDraft) => {
  if (draft.type === 'vehicle') {
    if (!validateVehicleCategory(draft)) return false;
  } else {
    if (!trim(draft.common.category).length) return false;
  }
  const cond = draft.common.condition;
  return cond === 'new' || cond === 'used' || cond === 'certified';
};

export const validateVehicle = (draft: ListingDraft) => {
  if (draft.type !== 'vehicle') return true;
  const vehicle = draft.vehicle;
  if (!vehicle) return false;
  if (!trim(vehicle.brand) || !trim(vehicle.model)) return false;
  if (!isModelAllowedForBrand(vehicle.brand, vehicle.model)) return false;
  if (
    trim(vehicle.trim) &&
    !isTrimAllowedForVehicle(vehicle.brand, vehicle.model, vehicle.trim)
  ) {
    return false;
  }
  return true;
};

export const validatePart = (draft: ListingDraft) => {
  if (draft.type !== 'part') return true;
  const part = draft.part;
  if (!part) return false;
  return trim(part.name).length > 0;
};

export const validatePricing = (draft: ListingDraft) => {
  const price = draft.common.pricing.price;
  return typeof price === 'number' && Number.isFinite(price) && price > 0;
};

/** Same rule as the backend: optional +, then 6-20 digits, spaces, dashes or brackets. */
export const isValidPhone = (value: string | undefined | null) =>
  /^\+?[0-9\s\-()]{6,20}$/.test(trim(value));

export const validateSeller = (draft: ListingDraft) => {
  return trim(draft.seller.name).length > 0 && isValidPhone(draft.seller.phone);
};

export const validatePhotos = (draft: ListingDraft) => {
  return draft.media.images.length > 0;
};

export const validateDraft = (draft: ListingDraft) => {
  return (
    validateBasics(draft) &&
    (draft.type === 'vehicle' ? validateVehicle(draft) : validatePart(draft)) &&
    validatePricing(draft) &&
    validateSeller(draft) &&
    validatePhotos(draft)
  );
};
