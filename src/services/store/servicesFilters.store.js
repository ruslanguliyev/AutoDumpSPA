import { create } from 'zustand';

const initialState = {
  city: '',
  radiusKm: '',
  serviceTypes: [],
  serviceCodes: [],
  brands: [],
  categories: [],
  ratingFrom: '',
  priceRange: [],
  verifiedOnly: false,
};

export const useServicesFiltersStore = create((set) => ({
  ...initialState,

  setCity: (city) => set({ city: city || '' }),
  
  setRadiusKm: (radiusKm) => set({ radiusKm: radiusKm || '' }),
  
  toggleServiceType: (type) =>
    set((state) => ({
      serviceTypes: state.serviceTypes.includes(type)
        ? state.serviceTypes.filter((t) => t !== type)
        : [...state.serviceTypes, type],
    })),
  
  toggleServiceCode: (code) =>
    set((state) => ({
      serviceCodes: state.serviceCodes.includes(code)
        ? state.serviceCodes.filter((c) => c !== code)
        : [...state.serviceCodes, code],
    })),
  
  toggleBrand: (brand) =>
    set((state) => ({
      brands: state.brands.includes(brand)
        ? state.brands.filter((b) => b !== brand)
        : [...state.brands, brand],
    })),
  
  toggleCategory: (category) =>
    set((state) => ({
      categories: state.categories.includes(category)
        ? state.categories.filter((c) => c !== category)
        : [...state.categories, category],
    })),
  
  setRatingFrom: (rating) => set({ ratingFrom: rating || '' }),
  
  togglePriceRange: (range) =>
    set((state) => {
      const numRange = Number(range);
      return {
        priceRange: state.priceRange.includes(numRange)
          ? state.priceRange.filter((r) => r !== numRange)
          : [...state.priceRange, numRange],
      };
    }),
  
  toggleVerified: () =>
    set((state) => ({
      verifiedOnly: !state.verifiedOnly,
    })),

  reset: () => set(initialState),
}));
