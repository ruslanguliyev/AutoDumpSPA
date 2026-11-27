const baseLanguage = (language) => String(language ?? '').slice(0, 2).toLowerCase();

/**
 * The part's name and description in the interface language. The API sends `translations`
 * ({ source, az?, ru?, en? }, each { name, description }) once a live listing has been
 * translated; until then, or for a language that is missing, the seller's original shows.
 * @param {{ name?: string; description?: string; translations?: Record<string, any> | null } | null | undefined} part
 * @param {string} language
 * @returns {{ name: string; description: string; translated: boolean }}
 */
export const localizePart = (part, language) => {
  const name = part?.name ?? '';
  const description = part?.description ?? '';
  const translations = part?.translations;
  const lang = baseLanguage(language);
  const entry = translations && lang !== translations.source ? translations[lang] : null;
  if (!entry?.name) return { name, description, translated: false };
  return {
    name: entry.name,
    // A part without a description has none in any language either.
    description: description ? (entry.description ?? description) : '',
    translated: true,
  };
};
