import { matchBrand, matchModel } from '../catalog/match-catalog';
import { PART_CATEGORY_VALUES, PartCategoryValue } from './part-photo-prompt';

export type PartPhotoConfidence = 'high' | 'medium' | 'low';

export type PartPhotoResult = {
  isCarPart: boolean;
  confidence: PartPhotoConfidence;
  name: string;
  category: PartCategoryValue | null;
  brand: string;
  partNumber: string;
  /** "Toyota Camry 2012–2017", one entry per car, matched to our own make/model catalogue. */
  compatibility: string[];
  description: string;
};

export class PartPhotoValidationError extends Error {}

const URL_OR_EMAIL = /https?:\/\/|www\.|\S+@\S+\.\S+/i;
const EMOJI = /\p{Extended_Pictographic}/u;
const CURRENT_YEAR = new Date().getFullYear();

const text = (value: unknown, max: number) => {
  if (typeof value !== 'string') return '';
  const cleaned = value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();
  return cleaned.length > max ? '' : cleaned;
};

const year = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1950 && value <= CURRENT_YEAR + 1 ? value : null;

/** Only makes and models our catalogue knows; anything else is dropped rather than shown. */
function compatibilityOf(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw.slice(0, 8)) {
    const entry = item as { brand?: unknown; model?: unknown; yearFrom?: unknown; yearTo?: unknown } | null;
    const brand = matchBrand(typeof entry?.brand === 'string' ? entry.brand : null);
    if (!brand) continue;
    const model = matchModel(brand, typeof entry?.model === 'string' ? entry.model : null);
    let from = year(entry?.yearFrom);
    let to = year(entry?.yearTo);
    if (from && to && to < from) [from, to] = [to, from];
    const years = from && to && from !== to ? `${from}–${to}` : from ? `${from}` : to ? `${to}` : '';
    // The wizard keeps compatibility as comma-separated text, so no entry may carry a comma.
    const label = [brand, model, model ? years : ''].filter(Boolean).join(' ').replace(/,/g, ' ');
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

export function buildPartPhotoResult(raw: unknown): PartPhotoResult {
  if (!raw || typeof raw !== 'object') throw new PartPhotoValidationError('shape');
  const value = raw as Record<string, unknown>;
  const confidence: PartPhotoConfidence =
    value.confidence === 'high' || value.confidence === 'medium' ? value.confidence : 'low';

  if (value.isCarPart !== true) {
    return {
      isCarPart: false,
      confidence,
      name: '',
      category: null,
      brand: '',
      partNumber: '',
      compatibility: [],
      description: '',
    };
  }

  const name = text(value.name, 120).replace(/\p{Extended_Pictographic}/gu, '').trim();
  if (!name) throw new PartPhotoValidationError('name');

  const description = text(value.description, 900);
  if (description && (URL_OR_EMAIL.test(description) || EMOJI.test(description))) {
    throw new PartPhotoValidationError('description');
  }

  const category = PART_CATEGORY_VALUES.includes(value.category as PartCategoryValue)
    ? (value.category as PartCategoryValue)
    : null;

  // A part number is letters, digits and separators; anything else is not one.
  const partNumber = text(value.partNumber, 40);
  const brand = text(value.brand, 60);

  return {
    isCarPart: true,
    confidence,
    name,
    category,
    brand: URL_OR_EMAIL.test(brand) ? '' : brand,
    partNumber: /^[A-Za-z0-9][A-Za-z0-9 .\-/]*$/.test(partNumber) ? partNumber : '',
    compatibility: compatibilityOf(value.compatibility),
    description,
  };
}
