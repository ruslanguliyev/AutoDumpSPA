import { registerEnumType } from '@nestjs/graphql';

/** Something a visitor can open. PART shares the listing counter with the car page. */
export enum ViewTarget {
  LISTING = 'LISTING',
  PART = 'PART',
  SERVICE_CENTER = 'SERVICE_CENTER',
  SPECIALIST = 'SPECIALIST',
  SELLER = 'SELLER',
}

registerEnumType(ViewTarget, { name: 'ViewTarget' });
