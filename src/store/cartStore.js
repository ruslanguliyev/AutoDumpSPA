import { create } from 'zustand';

export const useCartStore = create((set) => ({
  items: [],
  addToCart: (part) =>
    set((state) => ({
      items: [...state.items, part],
    })),
  removeFromCartAt: (index) =>
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    })),
  clearCart: () => set({ items: [] }),
}));
