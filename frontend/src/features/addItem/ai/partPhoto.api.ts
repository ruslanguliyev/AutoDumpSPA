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

/** Sends the (already re-encoded) photo to `/ai/part-photo`. Signed-in sellers only. */
export async function recognizePartPhoto(
  photo: Blob,
  language: AiLanguageCode,
  signal?: AbortSignal,
): Promise<PartPhotoResult> {
  const form = new FormData();
  form.append('language', language);
  form.append('image', photo, 'part.jpg');
  const token = typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_STORAGE_KEY);
  const response = await fetch(`${API_BASE}/ai/part-photo`, {
    method: 'POST',
    body: form,
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (response.ok) return (await response.json()) as PartPhotoResult;
  if (response.status === 413) throw new GraphQLRequestError('INVALID_IMAGE', 'INVALID_IMAGE');
  const body = (await response.json().catch(() => null)) as { code?: string } | null;
  const code = body?.code ?? (response.status === 429 ? 'RATE_LIMITED' : 'UNAVAILABLE');
  throw new GraphQLRequestError(code, code);
}
