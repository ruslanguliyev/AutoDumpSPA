import {
  isListingLang,
  LISTING_LANGS,
  ListingLang,
  NAME_MAX_LENGTH,
  PartText,
  TRANSLATED_DESCRIPTION_MAX_LENGTH,
} from '../../translations/part-translations';

export class TranslateValidationError extends Error {}

export type TranslateResult = { source: ListingLang } & Record<ListingLang, PartText>;

const URL_OR_EMAIL = /https?:\/\/|www\.|\S+@\S+\.\S+/i;
const PHONE = /\+?\d[\d\s()-]{8,}\d/;

const clean = (value: unknown) =>
  typeof value === 'string'
    ? value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').replace(/[ \t]+/g, ' ').trim()
    : '';

/**
 * Checks the model's translations. The seller's own language keeps the seller's exact text,
 * and a translation may not bring in a link, e-mail or phone number the original did not have.
 */
export function buildTranslateResult(raw: unknown, original: PartText): TranslateResult {
  if (!raw || typeof raw !== 'object') throw new TranslateValidationError('shape');
  const value = raw as Record<string, unknown>;
  const source = isListingLang(value.sourceLanguage) ? value.sourceLanguage : null;
  if (!source) throw new TranslateValidationError('source');

  const originalText = `${original.name}\n${original.description ?? ''}`;
  const allowContacts = URL_OR_EMAIL.test(originalText) || PHONE.test(originalText);
  const hasDescription = Boolean(original.description?.trim());

  const out = { source } as TranslateResult;
  for (const lang of LISTING_LANGS) {
    if (lang === source) {
      out[lang] = { name: original.name, description: original.description };
      continue;
    }
    const entry = (value[lang] ?? {}) as Record<string, unknown>;
    const name = clean(entry.name);
    const description = hasDescription ? clean(entry.description) : '';
    if (!name || name.length > NAME_MAX_LENGTH) throw new TranslateValidationError(`${lang}.name`);
    if (hasDescription && !description) throw new TranslateValidationError(`${lang}.description`);
    if (description.length > TRANSLATED_DESCRIPTION_MAX_LENGTH) throw new TranslateValidationError(`${lang}.length`);
    if (!allowContacts && (URL_OR_EMAIL.test(`${name}\n${description}`) || PHONE.test(`${name}\n${description}`))) {
      throw new TranslateValidationError(`${lang}.contacts`);
    }
    out[lang] = { name, description: description || null };
  }
  return out;
}
