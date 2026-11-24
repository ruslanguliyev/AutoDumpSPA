import { DESCRIPTION_MAX_LENGTH } from '../../listings/description-limit';

export type AiLanguageCode = 'AZ' | 'RU' | 'EN';

export type DescriptionFacts = {
  brand: string;
  model: string;
  generation?: string | null;
  trim?: string | null;
  year: number;
  mileage?: number | null;
  engineVolume?: number | null;
  horsepower?: number | null;
  transmission?: string | null;
  fuel?: string | null;
  bodyType?: string | null;
  condition?: string | null;
  city?: string | null;
};

const FACT_KEYS = [
  'brand',
  'model',
  'generation',
  'trim',
  'year',
  'mileage',
  'engineVolume',
  'horsepower',
  'transmission',
  'fuel',
  'bodyType',
  'condition',
  'city',
] as const;

type FactKey = (typeof FACT_KEYS)[number];

const HINTS: Record<AiLanguageCode, { serviceHistory: string; owners: string; equipment: string; prefix: string }> = {
  RU: {
    serviceHistory: 'история обслуживания',
    owners: 'количество владельцев',
    equipment: 'комплектация',
    prefix: 'Добавьте от себя',
  },
  EN: {
    serviceHistory: 'service history',
    owners: 'number of owners',
    equipment: 'equipment',
    prefix: 'Add in your own words',
  },
  AZ: {
    serviceHistory: 'servis tarixçəsi',
    owners: 'sahiblərin sayı',
    equipment: 'komplektasiya',
    prefix: 'Özünüz əlavə edin',
  },
};

const URL_OR_EMAIL = /https?:\/\/|www\.|\S+@\S+\.\S+/i;
const EMOJI = /\p{Extended_Pictographic}/u;

export class DescriptionValidationError extends Error {}

const filled = (value: unknown): boolean => {
  if (typeof value === 'number') return Number.isFinite(value);
  return typeof value === 'string' && value.trim().length > 0;
};

const formatNumber = (value: number, language: AiLanguageCode) =>
  new Intl.NumberFormat(language === 'EN' ? 'en-US' : 'ru-RU')
    .format(value)
    .replace(/\u00a0/g, ' ')
    .replace(/\u202f/g, ' ');

const usedLabel = (key: FactKey, facts: DescriptionFacts, language: AiLanguageCode): string | null => {
  switch (key) {
    case 'brand':
      return facts.brand.trim();
    case 'model':
      return facts.model.trim();
    case 'generation':
      return facts.generation?.trim() || null;
    case 'trim':
      return facts.trim?.trim() || null;
    case 'year':
      return String(facts.year);
    case 'mileage':
      return facts.mileage != null ? `${formatNumber(facts.mileage, language)} ${language === 'EN' ? 'km' : 'км'}` : null;
    case 'engineVolume':
      return facts.engineVolume != null
        ? `${facts.engineVolume} ${language === 'EN' ? 'L' : 'л'}`
        : null;
    case 'horsepower':
      return facts.horsepower != null ? `${facts.horsepower} ${language === 'EN' ? 'hp' : 'л.с.'}` : null;
    case 'transmission':
      return facts.transmission?.trim() || null;
    case 'fuel':
      return facts.fuel?.trim() || null;
    case 'bodyType':
      return facts.bodyType?.trim() || null;
    case 'condition':
      return facts.condition?.trim() || null;
    case 'city':
      return facts.city?.trim() || null;
    default:
      return null;
  }
};

/**
 * Hints are assembled here, not by the model: only facts the form does not have
 * (service history, owners) and equipment when trim was not passed.
 */
export function missingHintKeys(facts: DescriptionFacts): Array<'serviceHistory' | 'owners' | 'equipment'> {
  const keys: Array<'serviceHistory' | 'owners' | 'equipment'> = ['serviceHistory', 'owners'];
  if (!facts.trim?.trim()) keys.push('equipment');
  return keys;
}

export function buildDescriptionResult(input: {
  text: unknown;
  usedKeys: unknown;
  facts: DescriptionFacts;
  language: AiLanguageCode;
}): { text: string; usedFields: string[]; missingHints: string[] } {
  if (typeof input.text !== 'string') throw new DescriptionValidationError('text');
  let body = input.text.replace(/\s+$/u, '').replace(/\n*\[[^\]\n]{0,300}\]\s*$/u, '').trim();
  if (!body || URL_OR_EMAIL.test(body) || EMOJI.test(body)) {
    throw new DescriptionValidationError('text');
  }

  const phrases = HINTS[input.language];
  const hintKeys = missingHintKeys(input.facts);
  const missingHints = hintKeys.map((key) => phrases[key]);
  let text = body;
  if (missingHints.length) {
    text = `${body}\n\n[${phrases.prefix}: ${missingHints.join(', ')}]`;
  }
  if (text.length > DESCRIPTION_MAX_LENGTH) throw new DescriptionValidationError('length');

  const claimed = Array.isArray(input.usedKeys)
    ? input.usedKeys.filter((key): key is FactKey => FACT_KEYS.includes(key as FactKey))
    : [];
  const keys = (claimed.length ? claimed : FACT_KEYS).filter((key) => filled(input.facts[key]));
  const usedFields = keys
    .map((key) => usedLabel(key, input.facts, input.language))
    .filter((label): label is string => Boolean(label));

  return { text, usedFields, missingHints };
}
