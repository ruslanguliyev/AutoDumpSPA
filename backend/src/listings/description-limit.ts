import { BadRequestException } from '@nestjs/common';

/** Shared cap for listing and vehicle descriptions, including AI drafts. */
export const DESCRIPTION_MAX_LENGTH = 2000;

export function assertDescriptionWithinLimit(description: string | null | undefined): void {
  if (description != null && description.length > DESCRIPTION_MAX_LENGTH) {
    throw new BadRequestException(
      `description must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
    );
  }
}
