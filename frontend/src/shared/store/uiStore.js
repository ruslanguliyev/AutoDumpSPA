import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { changeLanguage, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/i18n/config';

// Validate language
const validateLanguage = (lang) => {
  if (SUPPORTED_LANGUAGES.includes(lang)) {
    return lang;
  }
  return DEFAULT_LANGUAGE;
};

export const useUIStore = create(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: async (lang) => {
        const validLang = validateLanguage(lang);
        // Update i18next
        await changeLanguage(validLang);
        // Update store
        set({ language: validLang });
      },
    }),
    {
      name: 'autodump-ui',
      // Only persist language
      partialize: (state) => ({ language: state.language }),
    }
  )
);
