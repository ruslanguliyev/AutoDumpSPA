import { GQL_URL, GraphQLRequestError, TOKEN_STORAGE_KEY } from '@/lib/graphql';
import type { AiLanguageCode } from '@/features/ai/ai.api';

/** What the server read from a photo of a part. Condition and price are never in it. */
export type PartPhotoResult = {
  isCarPart: boolean;
  confidence: 'high' | 'medium' | 'low';
  name: string;
  /** One of PART_CATEGORIES, or null when none fitted. */
  category: string | null;
  brand: string;
  partNumber: string;
  /** Cars from our own make/model catalogue, e.g. "Toyota Camry 2012–2017". */
  compatibility: string[];
  /** True when the fitment comes from a number or label on the photo; false for an informed guess. */
  compatibilityConfirmed: boolean;
  description: string;
};

const API_BASE = GQL_URL.replace(/\/graphql\/?$/, '');

/** Posts an (already re-encoded) photo to an `/ai/*-photo` route. Signed-in sellers only. */
export async function postAiPhoto<T>(
  route: 'part-photo' | 'car-photo',
  photo: Blob,
  language: AiLanguageCode,
  signal?: AbortSignal,
): Promise<T> {
  const form = new FormData();
  form.append('language', language);
  form.append('image', photo, 'photo.jpg');
  const token = typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_STORAGE_KEY);
  const response = await fetch(`${API_BASE}/ai/${route}`, {
    method: 'POST',
    body: form,
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (response.ok) return (await response.json()) as T;
  if (response.status === 413) throw new GraphQLRequestError('INVALID_IMAGE', 'INVALID_IMAGE');
  const body = (await response.json().catch(() => null)) as { code?: string } | null;
  const code = body?.code ?? (response.status === 429 ? 'RATE_LIMITED' : 'UNAVAILABLE');
  throw new GraphQLRequestError(code, code);
}

/** Sends the photo of a part to `/ai/part-photo`. */
export const recognizePartPhoto = (photo: Blob, language: AiLanguageCode, signal?: AbortSignal) =>
  postAiPhoto<PartPhotoResult>('part-photo', photo, language, signal);

/** What the server read from a photo of a car. Price, mileage, condition, VIN and plate are never in it. */
export type CarPhotoResult = {
  isCar: boolean;
  confidence: 'high' | 'medium' | 'low';
  /** A make from the server catalogue, or ''. */
  brand: string;
  model: string;
  /** One of VEHICLE_CATEGORY_IDS, or null. */
  bodyType: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  fuel: string | null;
  transmission: string | null;
  drivetrain: string | null;
  /** Filled fields that are a guess from the look of the car. */
  likely: Array<'model' | 'bodyType' | 'years' | 'fuel' | 'transmission' | 'drivetrain'>;
  description: string;
};

/** Sends the photo of a car to `/ai/car-photo`. */
export const recognizeCarPhoto = (photo: Blob, language: AiLanguageCode, signal?: AbortSignal) =>
  postAiPhoto<CarPhotoResult>('car-photo', photo, language, signal);
