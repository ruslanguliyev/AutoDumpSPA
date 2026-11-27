import {
  isListingLang,
  LISTING_LANGS,
  ListingLang,
} from '../../translations/part-translations';
import { TextFields, TRANSLATED_FIELD_MAX_LENGTH } from '../../translations/text-translations';
import type { AiTool } from '../providers/ai-provider';
import { TranslateValidationError } from './translate-result';

/**
 * Translates any set of a seller's text fields (a car description, a service center's
 * description and price list, a master's bio) into the three site languages.
 *
 * The fields go to the model as f1, f2, ... so the tool schema only ever holds plain names,
 * whatever the field keys look like ("service:oil-change-1").
 */

export type FieldsTranslateResult = { source: ListingLang } & Record<ListingLang, TextFields>;

/** Stable aliases for the fields of one call: [alias, key] in key order. */
export function fieldAliases(fields: TextFields): Array<[string, string]> {
  return Object.keys(fields)
    .sort()
    .map((key, index) => [`f${index + 1}`, key]);
}

export function translateFieldsTool(fields: TextFields): AiTool {
  const aliases = fieldAliases(fields);
  const language = {
    type: 'object',
    additionalProperties: false,
    properties: Object.fromEntries(
      aliases.map(([alias]) => [alias, { type: 'string', description: `Field ${alias} in this language.` }]),
    ),
    required: aliases.map(([alias]) => alias),
  };
  return {
    name: 'listing_translation',
    description: 'Every field of the seller text in Azerbaijani, Russian and English.',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        sourceLanguage: {
          type: 'string',
          enum: [...LISTING_LANGS],
          description: 'The language the seller mostly wrote in.',
        },
        az: language,
        ru: language,
        en: language,
      },
      required: ['sourceLanguage', 'az', 'ru', 'en'],
    },
  };
}

export function translateFieldsUserPrompt(fields: TextFields, context: string): string {
  const lines = [`What the text is: ${context}.`, 'Translate every field:'];
  for (const [alias, key] of fieldAliases(fields)) {
    lines.push(`<${alias}>`, fields[key], `</${alias}>`);
  }
  return lines.join('\n');
}

const URL_OR_EMAIL = /https?:\/\/|www\.|\S+@\S+\.\S+/i;
const PHONE = /\+?\d[\d\s()-]{8,}\d/;

const clean = (value: unknown) =>
  typeof value === 'string'
    ? value
        .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
        .replace(/[ \t]+/g, ' ')
        .trim()
    : '';

/**
 * Checks the model's translations. The seller's own language keeps the seller's exact text,
 * every field must come back non-empty, and a translation may not bring in a link, e-mail or
 * phone number the original did not have.
 */
export function buildFieldsTranslateResult(raw: unknown, original: TextFields): FieldsTranslateResult {
  if (!raw || typeof raw !== 'object') throw new TranslateValidationError('shape');
  const value = raw as Record<string, unknown>;
  const source = isListingLang(value.sourceLanguage) ? value.sourceLanguage : null;
  if (!source) throw new TranslateValidationError('source');

  const originalText = Object.values(original).join('\n');
  const allowContacts = URL_OR_EMAIL.test(originalText) || PHONE.test(originalText);
  const aliases = fieldAliases(original);

  const out = { source } as FieldsTranslateResult;
  for (const lang of LISTING_LANGS) {
    if (lang === source) {
      out[lang] = { ...original };
      continue;
    }
    const entry = (value[lang] ?? {}) as Record<string, unknown>;
    const fields: TextFields = {};
    for (const [alias, key] of aliases) {
      const text = clean(entry[alias]);
      if (!text) throw new TranslateValidationError(`${lang}.${alias}`);
      if (text.length > TRANSLATED_FIELD_MAX_LENGTH) throw new TranslateValidationError(`${lang}.${alias}.length`);
      if (!allowContacts && (URL_OR_EMAIL.test(text) || PHONE.test(text))) {
        throw new TranslateValidationError(`${lang}.${alias}.contacts`);
      }
      fields[key] = text;
    }
    out[lang] = fields;
  }
  return out;
}
