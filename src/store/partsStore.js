import { create } from 'zustand';
import { PARTS_DEFAULT_FILTER } from '@/domain/parts/parts.constants';

const STRING_FILTER_FIELDS = new Set([
  'search',
  'category',
  'brand',
  'model',
  'location',
  'condition',
  'sort',
  'priceFrom',
  'priceTo',
]);

const toFilterString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

export const usePartsStore = create((set) => ({
  filters: { ...PARTS_DEFAULT_FILTER },
  selectedPartId: null,

  setFilter: (field, value) =>
    set((state) => {
      const nextValue = STRING_FILTER_FIELDS.has(field) ? toFilterString(value) : value;
      const nextFilters = { ...state.filters, [field]: nextValue };

      // When Brand changes, Model must reset (prevents invalid "brand+model" combos).
      if (field === 'brand' && nextValue !== state.filters.brand) {
        nextFilters.model = '';
      }

      return { filters: nextFilters };
    }),

  resetFilters: () =>
    set({ filters: { ...PARTS_DEFAULT_FILTER }, selectedPartId: null }),

  selectPart: (partId) => set({ selectedPartId: partId }),
}));

