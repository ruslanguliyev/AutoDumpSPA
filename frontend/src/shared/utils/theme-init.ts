/**
 * Theme initialization - MUST run before React renders to prevent FOUC
 * Reads theme from localStorage or system preference and sets data-theme attribute
 * Also ensures localStorage is synced so Zustand store reads the correct initial value
 */

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'autodump-theme';

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  return null;
};

const setStoredTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to write theme to localStorage:', error);
  }
};

const applyTheme = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
};

/**
 * Initialize theme before React renders
 * Priority: localStorage > system preference > 'light'
 * Ensures localStorage is synced so Zustand store reads the correct initial value
 */
export const initTheme = (): Theme => {
  const storedTheme = getStoredTheme();
  const theme = storedTheme ?? getSystemTheme();
  
  // If no stored theme, persist the system preference so Zustand store stays in sync
  if (!storedTheme) {
    setStoredTheme(theme);
  }
  
  applyTheme(theme);
  return theme;
};

// Auto-initialize when this module is imported
initTheme();
