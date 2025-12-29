import { create } from 'zustand';
import { PARTS_DEFAULT_FILTER } from '@/domain/parts/parts.constants';

export const usePartsStore = create((set) => ({
  filters: { ...PARTS_DEFAULT_FILTER },
  selectedPartId: null,

  setFilter: (field, value) =>
    set((state) => ({
      filters: { ...state.filters, [field]: value },
    })),

  resetFilters: () =>
    set({ filters: { ...PARTS_DEFAULT_FILTER }, selectedPartId: null }),

  selectPart: (partId) => set({ selectedPartId: partId }),
}));

