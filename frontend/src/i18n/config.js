import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LANGUAGES = ['en', 'ru', 'az'];
export const DEFAULT_LANGUAGE = 'az';
export const NAMESPACES = ['common', 'part', 'vehicle', 'sellers', 'services', 'specialists', 'addListing', 'addItem', 'auth', 'home', 'dashboard', 'promote'];

// Each locale file is its own lazy module. vite.config.js groups them into one
// chunk per language, so a visitor downloads only the language they use.
const localeFiles = import.meta.glob('./locales/*/*.json', { import: 'default' });

const loadedLanguages = new Set();
const pendingLanguages = new Map();

export const loadLanguage = (lang) => {
  if (loadedLanguages.has(lang)) return Promise.resolve();
  if (!pendingLanguages.has(lang)) {
    const request = Promise.all(
      NAMESPACES.map(async (ns) => {
        const load = localeFiles[`./locales/${lang}/${ns}.json`];
        if (!load) return;
        i18n.addResourceBundle(lang, ns, await load(), true, true);
      }),
    )
      .then(() => {
        loadedLanguages.add(lang);
      })
      .finally(() => {
        pendingLanguages.delete(lang);
      });
    pendingLanguages.set(lang, request);
  }
  return pendingLanguages.get(lang);
};

// Get initial language from the URL prefix, then localStorage (via Zustand persist) or default
const getInitialLanguage = () => {
  // A deep link such as /ru/cars wins over the stored language, otherwise the
  // first paint would flash the stored language until the URL sync catches up.
  const urlLang = window.location.pathname.split('/')[1];
  if (SUPPORTED_LANGUAGES.includes(urlLang)) return urlLang;
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

// Single i18next instance initialized with initReactI18next. Resources are added
// per language by loadLanguage(); the app renders once i18nReady resolves.
const initialLanguage = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {},
  ns: NAMESPACES,
  defaultNS: 'common',
  fallbackLng: DEFAULT_LANGUAGE,
  lng: initialLanguage,
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export const i18nReady = loadLanguage(initialLanguage);

export const changeLanguage = async (lang) => {
  const next = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
  // Load the bundle first so the UI never renders raw keys while switching.
  await loadLanguage(next);
  await i18n.changeLanguage(next);
};

export default i18n;
