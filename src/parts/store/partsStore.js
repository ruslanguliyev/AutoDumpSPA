import { create } from 'zustand';

export const usePartsStore = create((set) => ({
  selectedPartId: null,
  selectPart: (partId) => set({ selectedPartId: partId }),
  resetSelection: () => set({ selectedPartId: null }),
}));
