/** Formats the server accepts. HEIC, GIF and SVG are not among them. */
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
/** What a person may pick; the browser shrinks it before upload. */
export const PHOTO_MAX_SOURCE_BYTES = 20 * 1024 * 1024;
/** Longest side sent to the model; larger photos only cost more without helping it. */
const MAX_SIDE = 1568;
const THUMB_SIDE = 160;

export class PhotoError extends Error {
  constructor(readonly reason: 'type' | 'size' | 'unreadable') {
    super(reason);
    this.name = 'PhotoError';
  }
}

export type PreparedPhoto = {
  /** Re-encoded JPEG: a fresh file drawn from pixels, so EXIF, GPS and anything hidden is gone. */
  blob: Blob;
  /** Small preview for the chat history. */
  thumbnail: string;
};

const draw = (bitmap: ImageBitmap, maxSide: number) => {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new PhotoError('unreadable');
  // White under transparent PNGs, which JPEG cannot keep.
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const toBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new PhotoError('unreadable'))), 'image/jpeg', quality),
  );

/**
 * Decodes the picked file as an image and draws it again. A file that does not decode as a
 * picture fails here, before anything is sent; the server checks the bytes again anyway.
 */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) throw new PhotoError('type');
  if (file.size > PHOTO_MAX_SOURCE_BYTES) throw new PhotoError('size');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new PhotoError('unreadable');
  }
  try {
    const blob = await toBlob(draw(bitmap, MAX_SIDE), 0.85);
    const thumbnail = draw(bitmap, THUMB_SIDE).toDataURL('image/jpeg', 0.7);
    return { blob, thumbnail };
  } finally {
    bitmap.close();
  }
}
