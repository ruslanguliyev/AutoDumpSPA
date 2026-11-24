/**
 * Checks a photo sent to the assistant before it goes anywhere.
 *
 * The bytes are never written to disk, served back or executed: they are only forwarded to
 * the model as an image. Still, we accept only what is provably a plain JPEG, PNG or WebP:
 * the type comes from the file's own signature (never from the name or the browser's
 * mimetype), the header must parse to sane dimensions, and files carrying a second format
 * (a ZIP, PDF, HTML or script glued to the image, the usual "polyglot" trick) are refused.
 * SVG, GIF, HEIC and everything else are refused outright.
 */

export type ChatImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

export type ChatImage = { mediaType: ChatImageMediaType; data: string; width: number; height: number };

export const CHAT_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
export const CHAT_IMAGE_MIN_SIDE = 32;
export const CHAT_IMAGE_MAX_SIDE = 8000;
export const CHAT_IMAGE_MAX_PIXELS = 40_000_000;

export class ChatImageError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'ChatImageError';
  }
}

const startsWith = (buffer: Buffer, bytes: number[], offset = 0) =>
  buffer.length >= offset + bytes.length && bytes.every((byte, index) => buffer[offset + index] === byte);

export function detectImageType(buffer: Buffer): ChatImageMediaType | null {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    return 'image/webp';
  }
  return null;
}

type Size = { width: number; height: number };

function pngSize(buffer: Buffer): Size {
  // IHDR is always the first chunk: length(4) "IHDR"(4) width(4) height(4).
  if (buffer.length < 33 || buffer.toString('latin1', 12, 16) !== 'IHDR') {
    throw new ChatImageError('png header');
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/** Byte offset just past the IEND chunk, walking the chunk list so every chunk is accounted for. */
function pngEnd(buffer: Buffer): number {
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('latin1', offset + 4, offset + 8);
    const next = offset + 12 + length;
    if (next > buffer.length) throw new ChatImageError('png chunk overflow');
    if (type === 'IEND') return next;
    offset = next;
  }
  throw new ChatImageError('png without IEND');
}

const JPEG_SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

function jpegSize(buffer: Buffer): Size {
  let offset = 2;
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) throw new ChatImageError('jpeg marker');
    const marker = buffer[offset + 1];
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > buffer.length) throw new ChatImageError('jpeg segment');
    if (JPEG_SOF.has(marker)) {
      if (length < 7) throw new ChatImageError('jpeg sof');
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    if (marker === 0xda) break; // start of scan before any frame header
    offset += 2 + length;
  }
  throw new ChatImageError('jpeg without frame');
}

function webpSize(buffer: Buffer): Size {
  if (buffer.length < 30) throw new ChatImageError('webp header');
  const riffSize = buffer.readUInt32LE(4);
  // The RIFF container must describe exactly this file, so nothing can ride along after it.
  if (riffSize + 8 !== buffer.length && riffSize + 9 !== buffer.length) {
    throw new ChatImageError('webp size mismatch');
  }
  const chunk = buffer.toString('latin1', 12, 16);
  if (chunk === 'VP8 ') {
    if (!startsWith(buffer, [0x9d, 0x01, 0x2a], 23)) throw new ChatImageError('webp vp8');
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    if (buffer[20] !== 0x2f) throw new ChatImageError('webp vp8l');
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    const width = 1 + (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16));
    const height = 1 + (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16));
    return { width, height };
  }
  throw new ChatImageError('webp chunk');
}

/** Signatures of other formats and markup that have no business inside a photo. */
const FOREIGN_SIGNATURES: Buffer[] = [
  // zip / docx / jar / apk: local file header plus a "version needed" of 1.0, 2.0 or 4.5,
  // six bytes so random compressed pixels practically never match.
  [0x50, 0x4b, 0x03, 0x04, 0x0a, 0x00],
  [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00],
  [0x50, 0x4b, 0x03, 0x04, 0x2d, 0x00],
  [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07], // rar
  [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c], // 7z
].map((bytes) => Buffer.from(bytes));

/** Markup and script openers, matched without regard to case. Five bytes or more each, for the same reason. */
const FOREIGN_TEXT = ['%pdf-', '<script', '<html', '<?php', '<iframe'];

function hasForeignContent(buffer: Buffer): boolean {
  if (FOREIGN_SIGNATURES.some((signature) => buffer.indexOf(signature) !== -1)) return true;
  const lower = buffer.toString('latin1').toLowerCase();
  return FOREIGN_TEXT.some((needle) => lower.includes(needle));
}

/** A Windows/DOS executable header at the very start, which a renamed .exe would carry. */
const isExecutable = (buffer: Buffer) => startsWith(buffer, [0x4d, 0x5a]) || startsWith(buffer, [0x7f, 0x45, 0x4c, 0x46]);

export function validateChatImage(buffer: Buffer | null | undefined): ChatImage {
  if (!buffer || buffer.length === 0) throw new ChatImageError('empty');
  if (buffer.length > CHAT_IMAGE_MAX_BYTES) throw new ChatImageError('too large');
  if (isExecutable(buffer)) throw new ChatImageError('executable');

  const mediaType = detectImageType(buffer);
  if (!mediaType) throw new ChatImageError('unsupported type');

  let size: Size;
  if (mediaType === 'image/png') {
    size = pngSize(buffer);
    // Anything after IEND is not part of the picture.
    if (buffer.length - pngEnd(buffer) > 0) throw new ChatImageError('png trailing data');
  } else if (mediaType === 'image/jpeg') {
    size = jpegSize(buffer);
    const end = buffer.lastIndexOf(Buffer.from([0xff, 0xd9]));
    if (end === -1 || buffer.length - (end + 2) > 16) throw new ChatImageError('jpeg trailing data');
  } else {
    size = webpSize(buffer);
  }

  const { width, height } = size;
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < CHAT_IMAGE_MIN_SIDE ||
    height < CHAT_IMAGE_MIN_SIDE ||
    width > CHAT_IMAGE_MAX_SIDE ||
    height > CHAT_IMAGE_MAX_SIDE ||
    width * height > CHAT_IMAGE_MAX_PIXELS
  ) {
    throw new ChatImageError('dimensions');
  }
  if (hasForeignContent(buffer)) throw new ChatImageError('foreign content');

  return { mediaType, data: buffer.toString('base64'), width, height };
}
