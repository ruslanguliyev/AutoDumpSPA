import { create } from 'zustand';

const initialState = {
  domain: 'all', // 'all' | 'cars' | 'parts'
  sellerTypes: [], // Array<'dealer' | 'reseller' | 'private'>
  rating: null, // number | null
  listings: 'any', // 'any' | '1-10' | '10-50'
  verifiedOnly: false,
};

export const useSellersFiltersStore = create((set) => ({
  ...initialState,

  toggleSellerType: (type) =>
    set((state) => ({
      sellerTypes: state.sellerTypes.includes(type)
        ? state.sellerTypes.filter((t) => t !== type)
        : [...state.sellerTypes, type],
    })),

  setDomain: (domain) => set({ domain }),
  setRating: (rating) => set({ rating }),
  setListings: (listings) => set({ listings }),
  toggleVerified: () =>
    set((state) => ({
      verifiedOnly: !state.verifiedOnly,
    })),

  reset: () => set(initialState),
}));

