import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PromotionOrderStatus, PromotionTarget, PromotionTier } from '@prisma/client';

registerEnumType(PromotionTier, { name: 'PromotionTier' });

// Re-exported so that catalogue types can take the enum from here: importing this file
// is what registers it with GraphQL, and importing it from Prisma alone would not.
export { PromotionTier, PromotionTarget };
registerEnumType(PromotionTarget, { name: 'PromotionTarget' });
registerEnumType(PromotionOrderStatus, { name: 'PromotionOrderStatus' });

@ObjectType()
export class PromotionPackageObject {
  @Field()
  code: string;

  @Field(() => PromotionTier)
  tier: PromotionTier;

  @Field(() => Int)
  days: number;

  @Field(() => Int)
  bumps: number;

  @Field(() => Int)
  bumpsPerDay: number;

  /** Price list amount in qapik, before any upgrade credit. */
  @Field(() => Int)
  listAmount: number;

  /** Unused days of a cheaper placement, taken off the price. */
  @Field(() => Int)
  creditAmount: number;

  /** What the buyer actually pays, in qapik. */
  @Field(() => Int)
  amount: number;

  @Field()
  recommended: boolean;
}

/** What is being promoted, enough for the checkout page to show it back to the buyer. */
@ObjectType()
export class PromotionTargetObject {
  @Field(() => PromotionTarget)
  targetType: PromotionTarget;

  @Field()
  targetId: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  imageUrl: string | null;

  /** Public page of the target, so the buyer can check they picked the right one. */
  @Field(() => String, { nullable: true })
  href: string | null;
}

@ObjectType()
export class PromotionQuoteObject {
  @Field(() => PromotionTargetObject)
  target: PromotionTargetObject;

  @Field()
  currency: string;

  @Field(() => [PromotionPackageObject])
  packages: PromotionPackageObject[];

  /** Highest placement running right now, if any. */
  @Field(() => PromotionTier, { nullable: true })
  activeTier: PromotionTier | null;

  @Field(() => Date, { nullable: true })
  activeUntil: Date | null;

  /** Bumps still owed by packages already bought. */
  @Field(() => Int)
  bumpsLeft: number;
}

@ObjectType()
export class PromotionOrderObject {
  /** The order's public handle; it is a secret, so only share the link with the buyer. */
  @Field()
  token: string;

  @Field(() => PromotionTargetObject)
  target: PromotionTargetObject;

  @Field(() => PromotionTier)
  tier: PromotionTier;

  @Field()
  packageCode: string;

  @Field(() => Int)
  days: number;

  @Field(() => Int)
  bumps: number;

  @Field(() => Int)
  listAmount: number;

  @Field(() => Int)
  creditAmount: number;

  @Field(() => Int)
  amount: number;

  @Field()
  currency: string;

  @Field(() => PromotionOrderStatus)
  status: PromotionOrderStatus;

  @Field()
  expiresAt: Date;

  @Field(() => Date, { nullable: true })
  paidAt: Date | null;

  /** Where the buyer pays. Null once the order is no longer payable. */
  @Field(() => String, { nullable: true })
  payUrl: string | null;
}

/** An active or finished placement, as its owner sees it in the dashboard. */
@ObjectType()
export class PromotionObject {
  @Field()
  id: string;

  @Field(() => PromotionTargetObject)
  target: PromotionTargetObject;

  @Field(() => PromotionTier)
  tier: PromotionTier;

  @Field()
  startsAt: Date;

  @Field()
  endsAt: Date;

  @Field(() => Int)
  bumpsTotal: number;

  @Field(() => Int)
  bumpsUsed: number;

  @Field(() => Date, { nullable: true })
  nextBumpAt: Date | null;

  @Field()
  active: boolean;

  @Field(() => String, { nullable: true })
  endedReason: string | null;

  /** Paid price in qapik; zero when an administrator granted it. */
  @Field(() => Int)
  amount: number;

  /** Views and contacts the target has collected since the placement started. */
  @Field(() => Int)
  viewsGained: number;

  @Field(() => Int)
  contactsGained: number;
}

@InputType()
export class CreatePromotionOrderInput {
  @Field(() => PromotionTarget)
  targetType: PromotionTarget;

  @Field()
  targetId: string;

  @Field()
  packageCode: string;

  /** Optional, for the receipt and so support has someone to answer. */
  @Field(() => String, { nullable: true })
  contactEmail?: string | null;

  @Field(() => String, { nullable: true })
  contactPhone?: string | null;
}

/** One row of the administrator's promotions list. */
@ObjectType()
export class AdminPromotionObject {
  @Field()
  id: string;

  @Field(() => PromotionTargetObject)
  target: PromotionTargetObject;

  @Field(() => PromotionTier)
  tier: PromotionTier;

  @Field()
  startsAt: Date;

  @Field()
  endsAt: Date;

  @Field()
  active: boolean;

  @Field(() => Int)
  amount: number;

  @Field()
  paid: boolean;

  @Field(() => String, { nullable: true })
  endedReason: string | null;
}
