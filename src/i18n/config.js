import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enVehicle from './locales/en/vehicle.json';
import enPart from './locales/en/part.json';
import enSellers from './locales/en/sellers.json';
import enServices from './locales/en/services.json';
import enAddListing from './locales/en/addListing.json';
import enAddItem from './locales/en/addItem.json';
import enAuth from './locales/en/auth.json';
import ruCommon from './locales/ru/common.json';
import ruVehicle from './locales/ru/vehicle.json';
import ruPart from './locales/ru/part.json';
import ruSellers from './locales/ru/sellers.json';
import ruServices from './locales/ru/services.json';
import ruAddListing from './locales/ru/addListing.json';
import ruAddItem from './locales/ru/addItem.json';
import ruAuth from './locales/ru/auth.json';
import azCommon from './locales/az/common.json';
import azVehicle from './locales/az/vehicle.json';
import azPart from './locales/az/part.json';
import azSellers from './locales/az/sellers.json';
import azServices from './locales/az/services.json';
import azAddListing from './locales/az/addListing.json';
import azAddItem from './locales/az/addItem.json';
import azAuth from './locales/az/auth.json';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'az'];
export const DEFAULT_LANGUAGE = 'en';
export const NAMESPACES = ['common', 'part', 'vehicle', 'sellers', 'services', 'addListing', 'addItem', 'auth'];

const resources = {
  en: { common: enCommon, vehicle: enVehicle, part: enPart, sellers: enSellers, services: enServices, addListing: enAddListing, addItem: enAddItem, auth: enAuth },
  ru: { common: ruCommon, vehicle: ruVehicle, part: ruPart, sellers: ruSellers, services: ruServices, addListing: ruAddListing, addItem: ruAddItem, auth: ruAuth },
  az: { common: azCommon, vehicle: azVehicle, part: azPart, sellers: azSellers, services: azServices, addListing: azAddListing, addItem: azAddItem, auth: azAuth },
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
