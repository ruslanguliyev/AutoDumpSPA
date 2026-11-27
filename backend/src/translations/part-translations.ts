import { createHash } from 'crypto';

/** The three interface languages. */
export const LISTING_LANGS = ['az', 'ru', 'en'] as const;
export type ListingLang = (typeof LISTING_LANGS)[number];

export type PartText = { name: string; description: string | null };

/**
 * Part.translations: the part's name and description in every interface language.
 *
 * `source` is the language the seller wrote in; its entry is the seller's own text.
 * `hash` is taken from the name and description the translations were made from, so a later
 * edit of the original makes them stale until they are made again.
 * `edited` lists the languages the seller corrected by hand.
 */
export type PartTranslations = {
  source: ListingLang;
  hash: string;
  edited: ListingLang[];
} & Partial<Record<ListingLang, PartText>>;

export const NAME_MAX_LENGTH = 200;
/** Translations run longer than the original, so they get more room than DESCRIPTION_MAX_LENGTH. */
export const TRANSLATED_DESCRIPTION_MAX_LENGTH = 3000;

export const isListingLang = (value: unknown): value is ListingLang =>
  typeof value === 'string' && (LISTING_LANGS as readonly string[]).includes(value);

/** Fingerprint of the original text, whitespace-insensitive at the ends. */
export function textHash(text: PartText): string {
  return createHash('sha256')
    .update(`${text.name.trim()}\u0000${(text.description ?? '').trim()}`)
    .digest('hex')
    .slice(0, 16);
}

const readText = (raw: unknown): PartText | null => {
  if (!raw || typeof raw !== 'object') return null;
  const { name, description } = raw as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()) return null;
  return {
    name,
    description: typeof description === 'string' && description.trim() ? description : null,
  };
};

/** The stored JSON, checked; anything malformed reads as no translations. */
export function parsePartTranslations(raw: unknown): PartTranslations | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;
  if (!isListingLang(value.source) || typeof value.hash !== 'string') return null;
  const out: PartTranslations = {
    source: value.source,
    hash: value.hash,
    edited: Array.isArray(value.edited) ? value.edited.filter(isListingLang) : [],
  };
  for (const lang of LISTING_LANGS) {
    const text = readText(value[lang]);
    if (text) out[lang] = text;
  }
  return out;
}

/**
 * What the API shows: the translations, only while they still match the part's current text.
 * Stale ones (the seller edited the original since) are hidden, so the original shows instead.
 */
export function readPartTranslations(raw: unknown, current?: PartText): PartTranslations | null {
  const parsed = parsePartTranslations(raw);
  if (!parsed) return null;
  if (current && parsed.hash !== textHash(current)) return null;
  return parsed;
}
