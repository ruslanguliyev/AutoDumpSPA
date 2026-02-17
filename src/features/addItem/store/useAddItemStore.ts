import { create } from 'zustand';

export type ListingType = 'vehicle' | 'part';
export type ListingStatus = 'draft' | 'ready' | 'published';
export type TitleMode = 'auto' | 'manual';

export type ListingImage = {
  id: string;
  url: string;
  isMain: boolean;
  label?: string;
};

export type ListingCommon = {
  titleMode: TitleMode;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'used' | 'certified';
  pricing: {
    price: number | null;
    currency: string;
    negotiable: boolean;
    vatIncluded: boolean;
  };
};

export type ListingMedia = {
  images: ListingImage[];
  pendingUrl: string;
};

export type ListingSeller = {
  type: 'private' | 'dealer';
  name: string;
  phone: string;
  email: string;
  location: string;
  showPhone: boolean;
};

export type ListingVehicle = {
  vin: string;
  brand: string;
  model: string;
  year: string;
  trim: string;
  mileage: string;
  transmission: string;
  fuel: string;
  drivetrain: string;
};

export type ListingPart = {
  name: string;
  brand: string;
  partNumber: string;
  condition: string;
  compatibility: string;
};

export type ListingDraft = {
  id: string;
  type: ListingType;
  status: ListingStatus;
  common: ListingCommon;
  media: ListingMedia;
  seller: ListingSeller;
  vehicle?: ListingVehicle;
  part?: ListingPart;
};

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type AddItemStoreState = {
  draft: ListingDraft | null;
  stepIndex: number;
  dirty: boolean;
  saveStatus: SaveStatus;
  setDraft: (draft: ListingDraft) => void;
  syncDraft: (draft: ListingDraft) => void;
  setStepIndex: (index: number) => void;
  nextStep: (totalSteps: number) => void;
  prevStep: () => void;
  setSaveStatus: (status: SaveStatus) => void;
  markSaved: () => void;
  setCommonField: <K extends keyof ListingCommon>(
    key: K,
    value: ListingCommon[K]
  ) => void;
  setPricingField: <K extends keyof ListingCommon['pricing']>(
    key: K,
    value: ListingCommon['pricing'][K]
  ) => void;
  setSellerField: <K extends keyof ListingSeller>(
    key: K,
    value: ListingSeller[K]
  ) => void;
  setVehicleField: <K extends keyof ListingVehicle>(
    key: K,
    value: ListingVehicle[K]
  ) => void;
  setPartField: <K extends keyof ListingPart>(
    key: K,
    value: ListingPart[K]
  ) => void;
  setMediaField: <K extends keyof ListingMedia>(
    key: K,
    value: ListingMedia[K]
  ) => void;
  addImage: (url: string) => void;
  removeImage: (id: string) => void;
  setMainImage: (id: string) => void;
};

const createId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `draft_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const createEmptyDraft = (type: ListingType): ListingDraft => ({
  id: createId(),
  type,
  status: 'draft',
  common: {
    titleMode: 'auto',
    title: '',
    description: '',
    category: '',
    condition: 'used',
    pricing: {
      price: null,
      currency: 'USD',
      negotiable: false,
      vatIncluded: false,
    },
  },
  media: {
    images: [],
    pendingUrl: '',
  },
  seller: {
    type: 'private',
    name: '',
    phone: '',
    email: '',
    location: '',
    showPhone: true,
  },
  vehicle:
    type === 'vehicle'
      ? {
          vin: '',
          brand: '',
          model: '',
          year: '',
          trim: '',
          mileage: '',
          transmission: '',
          fuel: '',
          drivetrain: '',
        }
      : undefined,
  part:
    type === 'part'
      ? {
          name: '',
          brand: '',
          partNumber: '',
          condition: '',
          compatibility: '',
        }
      : undefined,
});

const updateDraftState = (
  draft: ListingDraft | null,
  updater: (current: ListingDraft) => ListingDraft
): ListingDraft | null => {
  if (!draft) return draft;
  return updater(draft);
};

export const useAddItemStore = create<AddItemStoreState>((set) => ({
  draft: null,
  stepIndex: 0,
  dirty: false,
  saveStatus: 'idle',

  setDraft: (draft) =>
    set(() => ({
      draft,
      stepIndex: 0,
      dirty: false,
      saveStatus: 'idle',
    })),

  syncDraft: (draft) => set(() => ({ draft })),

  setStepIndex: (index) =>
    set((state) => ({
      stepIndex: Math.max(0, index),
    })),

  nextStep: (totalSteps) =>
    set((state) => ({
      stepIndex: Math.min(state.stepIndex + 1, Math.max(totalSteps - 1, 0)),
    })),

  prevStep: () =>
    set((state) => ({
      stepIndex: Math.max(state.stepIndex - 1, 0),
    })),

  setSaveStatus: (status) => set(() => ({ saveStatus: status })),

  markSaved: () => set(() => ({ dirty: false, saveStatus: 'saved' })),

  setCommonField: (key, value) =>
    set((state) => ({
      draft: updateDraftState(state.draft, (current) => ({
        ...current,
        common: {
          ...current.common,
          [key]: value,
        },
      })),
      dirty: true,
      saveStatus: 'idle',
    })),

  setPricingField: (key, value) =>
    set((state) => ({
      draft: updateDraftState(state.draft, (current) => ({
        ...current,
        common: {
          ...current.common,
          pricing: {
            ...current.common.pricing,
            [key]: value,
          },
        },
      })),
      dirty: true,
      saveStatus: 'idle',
    })),

  setSellerField: (key, value) =>
    set((state) => ({
      draft: updateDraftState(state.draft, (current) => ({
        ...current,
        seller: {
          ...current.seller,
          [key]: value,
        },
      })),
      dirty: true,
      saveStatus: 'idle',
    })),

  setVehicleField: (key, value) =>
    set((state) => ({
      draft: updateDraftState(state.draft, (current) => ({
        ...current,
        vehicle: current.vehicle
          ? {
              ...current.vehicle,
              [key]: value,
            }
          : undefined,
      })),
      dirty: true,
      saveStatus: 'idle',
    })),

  setPartField: (key, value) =>
    set((state) => ({
      draft: updateDraftState(state.draft, (current) => ({
        ...current,
        part: current.part
          ? {
              ...current.part,
              [key]: value,
            }
          : undefined,
      })),
      dirty: true,
      saveStatus: 'idle',
    })),

  setMediaField: (key, value) =>
    set((state) => ({
      draft: updateDraftState(state.draft, (current) => ({
        ...current,
        media: {
          ...current.media,
          [key]: value,
        },
      })),
      dirty: true,
      saveStatus: 'idle',
    })),

  addImage: (url) =>
    set((state) => ({
      draft: updateDraftState(state.draft, (current) => {
        const normalized = url.trim();
        if (!normalized) return current;
        const hasMain = current.media.images.some((image) => image.isMain);
        const nextImage: ListingImage = {
          id: createId(),
          url: normalized,
          isMain: !hasMain,
        };
        return {
          ...current,
          media: {
            ...current.media,
            images: [...current.media.images, nextImage],
          },
        };
      }),
      dirty: true,
      saveStatus: 'idle',
    })),

  removeImage: (id) =>
    set((state) => ({
      draft: updateDraftState(state.draft, (current) => {
        const nextImages = current.media.images.filter(
          (image) => image.id !== id
        );
        const hasMain = nextImages.some((image) => image.isMain);
        return {
          ...current,
          media: {
            ...current.media,
            images: hasMain
              ? nextImages
              : nextImages.map((image, index) => ({
                  ...image,
                  isMain: index === 0,
                })),
          },
        };
      }),
      dirty: true,
      saveStatus: 'idle',
    })),

  setMainImage: (id) =>
    set((state) => ({
      draft: updateDraftState(state.draft, (current) => ({
        ...current,
        media: {
          ...current.media,
          images: current.media.images.map((image) => ({
            ...image,
            isMain: image.id === id,
          })),
        },
      })),
      dirty: true,
      saveStatus: 'idle',
    })),
}));
