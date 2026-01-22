import { create } from 'zustand';

const initialState = {
  // Newer pages (e.g. `SellersPage.jsx`) use these:
  domainFilter: 'all', // 'all' | 'cars' | 'parts'
  typeFilter: 'all', // 'all' | 'dealer' | 'reseller' | 'private'

  // Existing sellers UI uses these:
  domain: 'all',
  sellerTypes: ['dealer', 'reseller', 'private'],
  rating: null,
  listings: 'any',
  country: 'Germany',
  city: 'Berlin',
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

  setDomainFilter: (domainFilter) => set({ domainFilter }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),

  setDomain: (domain) => set({ domain }),
  setRating: (rating) => set({ rating }),
  setListings: (listings) => set({ listings }),
  setLocation: (country, city) => set({ country, city }),
  toggleVerified: () =>
    set((state) => ({ verifiedOnly: !state.verifiedOnly })),

  resetFilters: () => set({ domainFilter: 'all', typeFilter: 'all' }),
  reset: () => set({ ...initialState, country: null, city: null }),
}));

// Back-compat alias for pages that import `useSellersStore`
export const useSellersStore = useSellersFiltersStore;
