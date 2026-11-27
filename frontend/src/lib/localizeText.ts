/**
 * Seller-written text (a car description, a service center's description and price list,
 * a master's bio) in the interface language.
 *
 * The API sends `translations` as { source, az?, ru?, en? }, each language { [field]: text },
 * once the AI has translated the current text. Until then, for the seller's own language, or
 * when a field is missing, the seller's original shows.
 */

export type TextLang = 'az' | 'ru' | 'en';

export const TEXT_LANGS: TextLang[] = ['az', 'ru', 'en'];

export type TextTranslations = {
  source: TextLang;
  /** Fingerprint of the text the translations were made from. */
  hash?: string;
  edited?: TextLang[];
} & Partial<Record<TextLang, Record<string, string>>>;

/** Price-list titles are keyed by the item's code. */
export const serviceItemKey = (code: string) => `service:${code}`;

const baseLanguage = (language: string | null | undefined) => String(language ?? '').slice(0, 2).toLowerCase();

const isTranslations = (value: unknown): value is TextTranslations =>
  Boolean(value && typeof value === 'object' && typeof (value as { source?: unknown }).source === 'string');

/** The field in the interface language, or `original` when there is no translation for it. */
export function localizeText(
  translations: unknown,
  language: string | null | undefined,
  key: string,
  original: string | null | undefined,
): string {
  const fallback = original ?? '';
  if (!fallback.trim() || !isTranslations(translations)) return fallback;
  const lang = baseLanguage(language) as TextLang;
  if (lang === translations.source) return fallback;
  const text = translations[lang]?.[key];
  return typeof text === 'string' && text.trim() ? text : fallback;
}
