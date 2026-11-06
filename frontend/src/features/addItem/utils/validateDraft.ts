import type { ListingDraft } from '@/features/addItem/store/useAddItemStore';
import {
  isModelAllowedForBrand,
  isTrimAllowedForVehicle,
  isVehicleCategoryId,
} from '@/features/addItem/constants/vehicleCatalog';

const trim = (value: string | undefined | null) => String(value ?? '').trim();

/** Engine volume in litres ("2.0", "2,5"); undefined when missing or implausible. */
export const parseEngineVolume = (value: string | undefined | null): number | undefined => {
  const n = parseFloat(trim(value).replace(',', '.'));
  return Number.isFinite(n) && n > 0 && n <= 20 ? n : undefined;
};

/** Power in horsepower ("150", "150 hp"); undefined when missing or implausible. */
export const parsePower = (value: string | undefined | null): number | undefined => {
  const n = parseInt(trim(value), 10);
  return Number.isFinite(n) && n > 0 && n <= 3000 ? n : undefined;
};

/** Stock quantity as a whole number >= 0; undefined when invalid. */
export const parseStock = (value: string | number | undefined | null): number | undefined => {
  const raw = trim(value === undefined || value === null ? '' : String(value));
  if (!/^\d{1,6}$/.test(raw)) return undefined;
  return parseInt(raw, 10);
};

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
  if (parseEngineVolume(vehicle.displacement) === undefined) return false;
  if (parsePower(vehicle.horsepower) === undefined) return false;
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
  return trim(part.name).length > 0 && parseStock(part.stock) !== undefined;
};

export const validatePricing = (draft: ListingDraft) => {
  const price = draft.common.pricing.price;
  return typeof price === 'number' && Number.isFinite(price) && price > 0;
};

/** Same rule as the backend: optional +, then 6-20 digits, spaces, dashes or brackets. */
export const isValidPhone = (value: string | undefined | null) =>
  /^\+?[0-9\s\-()]{6,20}$/.test(trim(value));

/** Same rule as the backend. */
export const isValidEmail = (value: string | undefined | null) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trim(value));

export const validateSeller = (draft: ListingDraft) => {
  const email = trim(draft.seller.email);
  return (
    trim(draft.seller.name).length > 0 &&
    isValidPhone(draft.seller.phone) &&
    (email === '' || isValidEmail(email))
  );
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
