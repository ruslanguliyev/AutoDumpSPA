import { Field, Float, InputType, ObjectType, registerEnumType, Int } from '@nestjs/graphql';
import { ReviewTargetType } from '../reviews/review.types';
import { ReportReason, ReportStatus, ListingStatus } from '@prisma/client';

registerEnumType(ReportReason, { name: 'ReportReason' });
registerEnumType(ReportStatus, { name: 'ReportStatus' });

@InputType()
export class ReportListingInput {
  @Field()
  listingId: string;

  @Field(() => ReportReason)
  reason: ReportReason;

  @Field({ nullable: true })
  details?: string;
}

/** Everything a moderator needs to judge a report without opening other pages. */
@ObjectType()
export class ReportObject {
  @Field()
  id: string;

  @Field()
  listingId: string;

  @Field()
  listingTitle: string;

  @Field(() => ListingStatus)
  listingStatus: ListingStatus;

  /** Vehicle/part id for linking to the public page. */
  @Field({ nullable: true })
  itemId?: string | null;

  /** 'vehicle' | 'part' | 'service' | 'unknown' */
  @Field()
  kind: string;

  @Field()
  sellerName: string;

  @Field(() => ReportReason)
  reason: ReportReason;

  @Field({ nullable: true })
  details?: string | null;

  @Field(() => ReportStatus)
  status: ReportStatus;

  @Field()
  reporterEmail: string;

  /** How many open reports this listing has in total. */
  @Field(() => Int)
  openReportsForListing: number;

  @Field()
  createdAt: Date;
}

/** A seller, specialist or service center as an administrator sees it when verifying profiles. */
@ObjectType()
export class AdminProfileObject {
  @Field()
  id: string;

  @Field(() => ReviewTargetType)
  targetType: ReviewTargetType;

  @Field()
  name: string;

  @Field()
  city: string;

  @Field(() => String, { nullable: true })
  slug: string | null;

  @Field(() => Float)
  rating: number;

  @Field(() => Int)
  reviewsCount: number;

  @Field()
  verified: boolean;
}
