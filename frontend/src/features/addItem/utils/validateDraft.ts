import type { ListingDraft } from '@/features/addItem/store/useAddItemStore';

const trim = (value: string | undefined | null) => String(value ?? '').trim();

const buildVehicleTitle = (draft: ListingDraft) => {
  const vehicle = draft.vehicle;
  if (!vehicle) return '';
  return [vehicle.year, vehicle.brand, vehicle.model, vehicle.trim]
    .map((value) => trim(value))
    .filter(Boolean)
    .join(' ');
};

const buildPartTitle = (draft: ListingDraft) => {
  const part = draft.part;
  if (!part) return '';
  return [part.brand, part.name, part.partNumber]
    .map((value) => trim(value))
    .filter(Boolean)
    .join(' ');
};

export const getDraftTitle = (draft: ListingDraft) => {
  const manualTitle = trim(draft.common.title);
  if (draft.common.titleMode === 'manual') {
    return manualTitle || 'Untitled listing';
  }

  const autoTitle =
    draft.type === 'vehicle' ? buildVehicleTitle(draft) : buildPartTitle(draft);
  return autoTitle || (draft.type === 'vehicle' ? 'Untitled vehicle' : 'Untitled part');
};

export const validateBasics = (draft: ListingDraft) => {
  if (draft.common.titleMode === 'manual') {
    return trim(draft.common.title).length > 0;
  }
  const autoTitle =
    draft.type === 'vehicle' ? buildVehicleTitle(draft) : buildPartTitle(draft);
  return trim(autoTitle).length > 0;
};

export const validateVehicle = (draft: ListingDraft) => {
  if (draft.type !== 'vehicle') return true;
  const vehicle = draft.vehicle;
  if (!vehicle) return false;
  return trim(vehicle.brand).length > 0 && trim(vehicle.model).length > 0;
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

export const validateSeller = (draft: ListingDraft) => {
  return trim(draft.seller.name).length > 0 && trim(draft.seller.phone).length > 0;
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
