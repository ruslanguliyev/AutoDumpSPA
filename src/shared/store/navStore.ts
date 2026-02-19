import { create } from 'zustand';

/** ID of the currently open mega menu: 'parts' | 'auto_services' | null */
type OpenMegaMenuId = 'parts' | 'auto_services' | null;

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
