import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AiChatCard, AiChatRole } from './aiChat.api';

export type AiChatEntry = {
  id: string;
  role: AiChatRole;
  text: string;
  cards?: AiChatCard[];
  /** Small JPEG data URL of the photo sent with this message; the photo itself is not kept. */
  photo?: string;
};

type AiChatState = {
  open: boolean;
  entries: AiChatEntry[];
  setOpen: (open: boolean) => void;
  add: (entry: Omit<AiChatEntry, 'id'>) => void;
  reset: () => void;
};

/** Messages kept for the tab; older ones are not sent to the server anyway. */
const MAX_ENTRIES = 40;

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * One conversation per browser tab. sessionStorage keeps it across page changes and reloads,
 * and drops it when the tab closes; when storage is blocked it simply lives in memory.
 */
export const useAiChatStore = create<AiChatState>()(
  persist(
    (set) => ({
      open: false,
      entries: [],
      setOpen: (open) => set({ open }),
      add: (entry) =>
        set((state) => ({ entries: [...state.entries, { ...entry, id: newId() }].slice(-MAX_ENTRIES) })),
      reset: () => set({ entries: [] }),
    }),
    {
      name: 'avtobaz-ai-chat',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ entries: state.entries }),
    },
  ),
);
