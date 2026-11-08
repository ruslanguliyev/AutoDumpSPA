import { create } from 'zustand';

/** ID of the currently open mega menu. Parts is the only one the design gives. */
export type OpenMegaMenuId = 'parts' | null;

interface NavState {
  openMegaMenu: OpenMegaMenuId;
  setOpenMegaMenu: (id: OpenMegaMenuId) => void;
  closeMegaMenu: () => void;
}

export const useNavStore = create<NavState>((set) => ({
  openMegaMenu: null,
  setOpenMegaMenu: (id) => set({ openMegaMenu: id }),
  closeMegaMenu: () => set({ openMegaMenu: null }),
}));
