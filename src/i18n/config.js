import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enVehicle from './locales/en/vehicle.json';
import enPart from './locales/en/part.json';
import ruCommon from './locales/ru/common.json';
import ruVehicle from './locales/ru/vehicle.json';
import ruPart from './locales/ru/part.json';
import azCommon from './locales/az/common.json';
import azVehicle from './locales/az/vehicle.json';
import azPart from './locales/az/part.json';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'az'];
export const DEFAULT_LANGUAGE = 'en';
export const NAMESPACES = ['common', 'part', 'vehicle'];

const resources = {
  en: { common: enCommon, vehicle: enVehicle, part: enPart },
  ru: { common: ruCommon, vehicle: ruVehicle, part: ruPart },
  az: { common: azCommon, vehicle: azVehicle, part: azPart },
};

// Get initial language from localStorage (via Zustand persist) or default
const getInitialLanguage = () => {
  try {
    const stored = localStorage.getItem('autodump-ui');
    if (stored) {
      const parsed = JSON.parse(stored);
      const lang = parsed?.state?.language;
      if (lang && SUPPORTED_LANGUAGES.includes(lang)) {
        return lang;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_LANGUAGE;
};

// Single i18next instance initialized with initReactI18next + static resources
i18n.use(initReactI18next).init({
  resources,
  ns: NAMESPACES,
  defaultNS: 'common',
  fallbackLng: DEFAULT_LANGUAGE,
  lng: getInitialLanguage(),
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export const changeLanguage = async (lang) => {
  const next = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
  await i18n.changeLanguage(next);
};

export default i18n;
