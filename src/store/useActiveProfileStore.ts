import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ActiveProfile } from '@/dashboard/types/dashboard.types';

const ACTIVE_PROFILE_STORAGE_KEY = 'autodump-active-profile';

type PersistedProfile = ActiveProfile;

const defaultProfile: ActiveProfile = { type: 'user' };

const parsePersisted = (raw: unknown): ActiveProfile | null => {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const type = obj.type;
  if (type === 'user') return { type: 'user' };
  if (type === 'seller' && typeof obj.id === 'string') return { type: 'seller', id: obj.id };
  if (type === 'service' && typeof obj.id === 'string') return { type: 'service', id: obj.id };
  return null;
};

interface ActiveProfileStore {
  activeProfile: ActiveProfile;
  setActiveProfile: (profile: ActiveProfile) => void;
}

export const useActiveProfileStore = create<ActiveProfileStore>()(
  persist(
    (set) => ({
      activeProfile: defaultProfile,
      setActiveProfile: (profile) => set({ activeProfile: profile }),
    }),
    {
      name: ACTIVE_PROFILE_STORAGE_KEY,
      partialize: (state) => ({ activeProfile: state.activeProfile as PersistedProfile }),
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            const profile = parsePersisted(parsed?.state?.activeProfile);
            return profile ? { state: { activeProfile: profile }, version: parsed?.version ?? 0 } : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export function useActiveProfile(): ActiveProfile {
  return useActiveProfileStore((s) => s.activeProfile);
}
