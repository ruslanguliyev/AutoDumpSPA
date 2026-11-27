import { createHash } from 'crypto';

import { isListingLang, LISTING_LANGS, ListingLang } from './part-translations';

/**
 * Translations of the free text sellers write for cars, service centers and masters.
 *
 * Same idea as Part.translations (see part-translations.ts), but for any set of named text
 * fields instead of a fixed name and description:
 *   Vehicle.translations        { description }
 *   ServiceCenter.translations  { description, "service:<code>" for each price-list title }
 *   Specialist.translations     { bio }
 *
 * Stored JSON: { source, hash, edited, az?, ru?, en? }, each language { [field]: text }.
 * `source` is the language the seller wrote in, and its entry is the seller's own text.
 * `hash` fingerprints the original fields, so editing them makes the translations stale.
 * `edited` lists the languages the seller corrected by hand.
 */

/** Field name to the seller's text. Empty fields are left out. */
export type TextFields = Record<string, string>;

export type TextTranslations = {
  source: ListingLang;
  hash: string;
  edited: ListingLang[];
} & Partial<Record<ListingLang, TextFields>>;

/** Translations run longer than the original, so a field gets more room than the form allows. */
export const TRANSLATED_FIELD_MAX_LENGTH = 3000;

/** Price-list titles are keyed by the item's code. */
export const SERVICE_ITEM_PREFIX = 'service:';

/** The non-empty text fields, in a stable shape. */
export function textFields(raw: Record<string, string | null | undefined>): TextFields {
  const out: TextFields = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string' && value.trim()) out[key] = value;
  }
  return out;
}

export const vehicleTextFields = (row: { description: string | null }) =>
  textFields({ description: row.description });

export const specialistTextFields = (row: { bio: string | null }) => textFields({ bio: row.bio });

export const serviceCenterTextFields = (row: {
  description: string | null;
  services: Array<{ code: string; title: string }>;
}) =>
  textFields({
    description: row.description,
    ...Object.fromEntries(row.services.map((item) => [`${SERVICE_ITEM_PREFIX}${item.code}`, item.title])),
  });

/** Fingerprint of the original fields, independent of their order and of whitespace at the ends. */
export function fieldsHash(fields: TextFields): string {
  const hash = createHash('sha256');
  for (const key of Object.keys(fields).sort()) {
    hash.update(`${key}\u0001${fields[key].trim()}\u0000`);
  }
  return hash.digest('hex').slice(0, 16);
}

const readFields = (raw: unknown): TextFields | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const out: TextFields = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && value.trim()) out[key] = value;
  }
  return Object.keys(out).length ? out : null;
};

/** The stored JSON, checked; anything malformed reads as no translations. */
export function parseTextTranslations(raw: unknown): TextTranslations | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;
  if (!isListingLang(value.source) || typeof value.hash !== 'string') return null;
  const out: TextTranslations = {
    source: value.source,
    hash: value.hash,
    edited: Array.isArray(value.edited) ? value.edited.filter(isListingLang) : [],
  };
  for (const lang of LISTING_LANGS) {
    const fields = readFields(value[lang]);
    if (fields) out[lang] = fields;
  }
  return out;
}

/**
 * What the API shows: the translations, only while they still match the current text.
 * Stale ones (the seller edited the original since) are hidden, so the original shows instead.
 */
export function readTextTranslations(raw: unknown, current: TextFields): TextTranslations | null {
  const parsed = parseTextTranslations(raw);
  if (!parsed || !Object.keys(current).length) return null;
  if (parsed.hash !== fieldsHash(current)) return null;
  return parsed;
}
