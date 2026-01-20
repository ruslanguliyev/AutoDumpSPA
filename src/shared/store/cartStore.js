import { create } from 'zustand';

export const useCartStore = create((set) => ({
  items: [],
  /**
   * Adds an item to the cart.
   * - Keeps existing item fields (name/price/etc) for UI compatibility.
   * - Aggregates quantity by a best-effort item id.
   */
  addToCart: (part, quantity = 1) =>
    set((state) => {
      const safeQty = Number.isFinite(Number(quantity)) ? Math.max(1, Number(quantity)) : 1;

      const getId = (item) =>
        item?.id ?? item?._id ?? item?.sku ?? item?.code ?? item?.oemCode ?? item?.name ?? null;

      const partId = getId(part);
      if (partId == null) {
        return { items: [...state.items, { ...part, quantity: safeQty }] };
      }

      const idx = state.items.findIndex((item) => getId(item) === partId);
      if (idx < 0) {
        return { items: [...state.items, { ...part, quantity: safeQty }] };
      }

      const next = [...state.items];
      const prevQty = Number.isFinite(Number(next[idx]?.quantity)) ? Number(next[idx].quantity) : 1;
      next[idx] = { ...next[idx], ...part, quantity: prevQty + safeQty };
      return { items: next };
    }),
  removeFromCartAt: (index) =>
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    })),
  clearCart: () => set({ items: [] }),
}));
