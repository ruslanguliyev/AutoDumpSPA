import { Field, Float, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { RentalStatus } from '@prisma/client';

registerEnumType(RentalStatus, { name: 'RentalStatus' });

/** All dates in this module are plain "YYYY-MM-DD" strings (no time, no time zone). */

@InputType()
export class RentalTermsInput {
  @Field(() => Float, { nullable: true })
  deposit?: number;

  @Field(() => Int, { nullable: true })
  minDays?: number;

  @Field(() => Int, { nullable: true })
  maxDays?: number;

  /** Included kilometres per day; omit for unlimited. */
  @Field(() => Int, { nullable: true })
  kmPerDay?: number;

  @Field(() => Int, { nullable: true })
  minDriverAge?: number;
}

@InputType()
export class RequestRentalInput {
  @Field()
  listingId: string;

  /** First rental day. */
  @Field()
  startDate: string;

  /** Last rental day (inclusive). */
  @Field()
  endDate: string;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  phone?: string;
}

@ObjectType()
export class RentalBookingObject {
  @Field()
  id: string;

  @Field()
  listingId: string;

  @Field()
  listingTitle: string;

  /** Vehicle id for linking to the public page. */
  @Field({ nullable: true })
  vehicleId?: string | null;

  @Field({ nullable: true })
  thumbnail?: string | null;

  @Field()
  startDate: string;

  @Field()
  endDate: string;

  @Field(() => Int)
  days: number;

  @Field(() => Float)
  pricePerDay: number;

  @Field(() => Float)
  totalPrice: number;

  @Field(() => Float, { nullable: true })
  deposit?: number | null;

  @Field()
  currency: string;

  @Field({ nullable: true })
  message?: string | null;

  /** Phone left by the renter (visible to the owner). */
  @Field({ nullable: true })
  phone?: string | null;

  @Field(() => RentalStatus)
  status: RentalStatus;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  decidedAt?: Date | null;

  @Field()
  renterName: string;

  /** Only filled for the owner of the car. */
  @Field({ nullable: true })
  renterEmail?: string | null;

  @Field()
  sellerName: string;

  /** Visible to the renter once the booking is confirmed (or when the seller shows their phone). */
  @Field({ nullable: true })
  sellerPhone?: string | null;
}

@ObjectType()
export class UnavailableRangeObject {
  @Field()
  startDate: string;

  @Field()
  endDate: string;

  /** 'BOOKED' (confirmed booking) or 'BLOCKED' (the owner blocked these days). */
  @Field()
  reason: string;
}

@ObjectType()
export class RentalBlockObject {
  @Field()
  id: string;

  @Field()
  listingId: string;

  @Field()
  startDate: string;

  @Field()
  endDate: string;

  @Field({ nullable: true })
  note?: string | null;
}
