import { readFileSync } from 'fs';
import { join } from 'path';

import { ChatImageError, detectImageType, validateChatImage } from './chat-image';

const assets = join(__dirname, '../../../../frontend/src/assets/images');
const real = (name: string) => readFileSync(join(assets, name));

/** A minimal valid PNG of the given size (one IDAT chunk, not decodable, but structurally whole). */
function png(width: number, height: number, extra: Buffer = Buffer.alloc(0)): Buffer {
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    return Buffer.concat([length, Buffer.from(type, 'latin1'), data, Buffer.alloc(4)]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', Buffer.from([0x78, 0x9c, 0x63, 0x00, 0x00])),
    chunk('IEND', Buffer.alloc(0)),
    extra,
  ]);
}

const reason = (fn: () => unknown) => {
  try {
    fn();
  } catch (error) {
    return error instanceof ChatImageError ? error.message : `other: ${String(error)}`;
  }
  return 'accepted';
};

describe('validateChatImage', () => {
  it('accepts real JPEG photos and reads their size', () => {
    for (const name of ['brake-disk.jpg', 'G-wagon.jpeg', 'shock_absorber_vw.jpg', 'headlight.jpg']) {
      const image = validateChatImage(real(name));
      expect(image.mediaType).toBe('image/jpeg');
      expect(image.width).toBeGreaterThan(32);
      expect(image.height).toBeGreaterThan(32);
      expect(Buffer.from(image.data, 'base64').equals(real(name))).toBe(true);
    }
  });

  it('trusts the bytes, not the file name', () => {
    // brake-pads.jpg in the assets is really a PNG.
    expect(validateChatImage(real('brake-pads.jpg')).mediaType).toBe('image/png');
  });

  it('accepts a real PNG', () => {
    const file = readFileSync(join(__dirname, '../../../../frontend/public/icons/android-chrome-512x512.png'));
    expect(validateChatImage(file)).toEqual(expect.objectContaining({ mediaType: 'image/png', width: 512, height: 512 }));
  });

  it('accepts a structurally valid WebP (VP8L)', () => {
    const body = Buffer.alloc(30);
    body.write('RIFF', 0, 'latin1');
    body.writeUInt32LE(22, 4);
    body.write('WEBPVP8L', 8, 'latin1');
    body.writeUInt32LE(9, 16);
    body[20] = 0x2f;
    body.writeUInt32LE((99 & 0x3fff) | ((49 & 0x3fff) << 14), 21);
    expect(detectImageType(body)).toBe('image/webp');
    expect(validateChatImage(body)).toEqual(expect.objectContaining({ width: 100, height: 50 }));
  });

  it('refuses things that are not plain photos', () => {
    expect(reason(() => validateChatImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')))).toBe(
      'unsupported type',
    );
    expect(reason(() => validateChatImage(Buffer.from('GIF89a\u0001\u0000\u0001\u0000', 'latin1')))).toBe(
      'unsupported type',
    );
    expect(reason(() => validateChatImage(Buffer.concat([Buffer.from('MZ'), Buffer.alloc(200)])))).toBe('executable');
    expect(reason(() => validateChatImage(Buffer.alloc(0)))).toBe('empty');
    expect(reason(() => validateChatImage(Buffer.alloc(5 * 1024 * 1024, 0xff)))).toBe('too large');
  });

  it('refuses polyglots: data glued after the image or other formats inside it', () => {
    const zip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);
    expect(reason(() => validateChatImage(Buffer.concat([real('brake-disk.jpg'), Buffer.alloc(64, 0x41)])))).toBe(
      'jpeg trailing data',
    );
    expect(reason(() => validateChatImage(png(64, 64, zip)))).toBe('png trailing data');

    // A script hidden in a JPEG comment segment, before the end marker.
    const photo = real('brake-disk.jpg');
    const script = Buffer.from('<script>alert(1)</script>', 'latin1');
    const comment = Buffer.concat([Buffer.from([0xff, 0xfe, 0x00, script.length + 2]), script]);
    const withComment = Buffer.concat([photo.subarray(0, 2), comment, photo.subarray(2)]);
    expect(reason(() => validateChatImage(withComment))).toBe('foreign content');
  });

  it('refuses absurd dimensions', () => {
    expect(reason(() => validateChatImage(png(10, 10)))).toBe('dimensions');
    expect(reason(() => validateChatImage(png(9000, 100)))).toBe('dimensions');
    expect(reason(() => validateChatImage(png(7000, 7000)))).toBe('dimensions');
    expect(reason(() => validateChatImage(png(800, 600)))).toBe('accepted');
  });

  it('refuses a broken header', () => {
    expect(reason(() => validateChatImage(real('brake-disk.jpg').subarray(0, 40)))).not.toBe('accepted');
  });
});
