import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DASHBOARD_UI_KEY = 'autodump-dashboard-ui';

interface DashboardUIStore {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
}

export const useDashboardUIStore = create<DashboardUIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: DASHBOARD_UI_KEY,
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
