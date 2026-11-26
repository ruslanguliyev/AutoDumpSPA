/**
 * Focal point of a listing photo: which part of the picture stays visible when a
 * card crops it with `object-fit: cover`.
 *
 * It travels inside the image URL as a fragment (`/uploads/a.jpg#fp=50,30`), so it
 * is stored with the URL in `imageUrls` and reaches every card that already gets
 * the URL, with no extra field on the API. Browsers never send the fragment to the
 * server, so the file request is unchanged.
 */
export type ImageFocus = { x: number; y: number };

const CENTER: ImageFocus = { x: 50, y: 50 };
const FOCUS_RE = /#fp=(\d{1,3}(?:\.\d+)?),(\d{1,3}(?:\.\d+)?)$/;

const clamp = (value: number) => Math.min(100, Math.max(0, value));

/** The URL without its focal-point fragment. */
export const stripFocus = (url: string): string => url.replace(FOCUS_RE, '');

/** Focal point stored in the URL, the centre when there is none. */
export const parseFocus = (url: string | null | undefined): ImageFocus => {
  const match = typeof url === 'string' ? url.match(FOCUS_RE) : null;
  if (!match) return CENTER;
  return { x: clamp(Number(match[1])), y: clamp(Number(match[2])) };
};

/** The URL with a new focal point; the centre leaves the URL clean. */
export const withFocus = (url: string, focus: ImageFocus): string => {
  const base = stripFocus(url);
  const x = Math.round(clamp(focus.x));
  const y = Math.round(clamp(focus.y));
  if (x === 50 && y === 50) return base;
  return `${base}#fp=${x},${y}`;
};

/** `object-position` value for an image URL. */
export const focusPosition = (url: string | null | undefined): string => {
  const { x, y } = parseFocus(url);
  return `${x}% ${y}%`;
};
