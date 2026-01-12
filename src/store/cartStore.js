import { create } from 'zustand';

export const useCartStore = create((set) => ({
  items: [],
  addToCart: (part) =>
    set((state) => ({
      items: [...state.items, part],
    })),
}));
