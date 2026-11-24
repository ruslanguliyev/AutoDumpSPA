import { registerEnumType } from '@nestjs/graphql';

/** Something a visitor can open. PART keeps its own counter; a part view also increments the listing so promotion stats stay correct. */
export enum ViewTarget {
  LISTING = 'LISTING',
  PART = 'PART',
  SERVICE_CENTER = 'SERVICE_CENTER',
  SPECIALIST = 'SPECIALIST',
  SELLER = 'SELLER',
}

registerEnumType(ViewTarget, { name: 'ViewTarget' });
