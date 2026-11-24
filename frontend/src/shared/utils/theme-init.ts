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

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

/**
 * The key is owned by the zustand `persist` middleware, which stores
 * `{"state":{"theme":...},"version":0}`. A bare "light"/"dark" string is the legacy
 * format this module used to write; it is still read so existing visitors keep their theme.
 */
const getStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) return stored;
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      const theme = (parsed as { state?: { theme?: unknown } } | null)?.state?.theme;
      if (isTheme(theme)) return theme;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  return null;
};

const setStoredTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ state: { theme }, version: 0 }));
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
  
  // Always write in the persist format: this stores the system preference on a first
  // visit and migrates a legacy bare-string value, so the Zustand store rehydrates to
  // the theme already applied to the page.
  setStoredTheme(theme);

  applyTheme(theme);
  return theme;
};

// Auto-initialize when this module is imported
initTheme();
