/**
 * Allowed browser origins, from CORS_ORIGIN (comma-separated).
 * Defaults to the Vite dev server.
 */
export const getAllowedOrigins = (): string[] =>
  (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
