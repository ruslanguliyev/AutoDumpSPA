import { BadRequestException } from '@nestjs/common';

export const MIN_PASSWORD_LENGTH = 8;
/** bcrypt only uses the first 72 bytes of a password. */
export const MAX_PASSWORD_BYTES = 72;
export const MAX_NAME_LENGTH = 100;

/** Throws a 400 when the password is too short or too long for bcrypt. */
export function assertValidPassword(password: string): void {
  if ((password ?? '').length < MIN_PASSWORD_LENGTH) {
    throw new BadRequestException(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    );
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    throw new BadRequestException(`Password must be at most ${MAX_PASSWORD_BYTES} bytes long`);
  }
}

/** Trims the name and throws a 400 when it is empty or too long. */
export function normalizeFullName(value: string): string {
  const fullName = (value ?? '').trim();
  if (!fullName) {
    throw new BadRequestException('Full name is required');
  }
  if (fullName.length > MAX_NAME_LENGTH) {
    throw new BadRequestException(`Full name must be at most ${MAX_NAME_LENGTH} characters`);
  }
  return fullName;
}
