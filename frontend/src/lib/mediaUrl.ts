const GQL_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql';
const API_BASE = GQL_URL.replace(/\/graphql$/, '');

/**
 * Resolve a media URL for display.
 *
 * - Absolute URLs (http/https, blob:, data:) are returned as-is.
 * - Relative paths like "/uploads/abc.jpg" are prefixed with the API host.
 * - null/undefined/empty → null.
 */
export const resolveMediaUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) return `${API_BASE}${trimmed}`;
  return `${API_BASE}/${trimmed}`;
};

/**
 * Normalize a backend upload URL for persistence.
 *
 * The backend returns "/uploads/abc.jpg". We want to store RELATIVE paths in the
 * database (and in draft.media.images) so that changing the API host never
 * breaks existing listings. If the backend returned a full URL, we strip the
 * host and keep the path.
 */
export const normalizeUploadUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return trimmed;
  }
};

export const getApiBase = () => API_BASE;
