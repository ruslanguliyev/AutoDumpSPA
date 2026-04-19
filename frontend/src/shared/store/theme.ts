import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'autodump-theme';

const applyThemeToDocument = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
};

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme: Theme) => {
        applyThemeToDocument(theme);
        set({ theme });
      },
      toggleTheme: () => {
        set((state) => {
          const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
          applyThemeToDocument(nextTheme);
          return { theme: nextTheme };
        });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply persisted theme on rehydration
          applyThemeToDocument(state.theme);
        }
      },
    }
  )
);
