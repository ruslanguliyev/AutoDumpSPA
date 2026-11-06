import '../auth/auth.types';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { SellerType } from '@prisma/client';

@ObjectType()
export class SellerObject {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => SellerType)
  type: SellerType;

  @Field()
  name: string;

  @Field()
  city: string;

  /** Hidden (null) in public queries when the seller disabled showPhone. */
  @Field({ nullable: true })
  phone?: string | null;

  @Field()
  showPhone: boolean;

  /** Private: only filled for the seller themselves (mySeller / create / update). */
  @Field({ nullable: true })
  contactEmail?: string | null;

  /** Number of published listings. Only filled by the public seller queries. */
  @Field(() => Int, { nullable: true })
  listingsCount?: number | null;

  @Field()
  rating: number;

  @Field(() => Int)
  reviewsCount: number;

  @Field()
  verified: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateSellerInput {
  @Field(() => SellerType)
  type: SellerType;

  @Field()
  name: string;

  @Field()
  city: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  showPhone?: boolean;

  @Field({ nullable: true })
  contactEmail?: string;
}

@InputType()
export class UpdateSellerInput {
  @Field(() => SellerType, { nullable: true })
  type?: SellerType;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  city?: string;

  /** Empty string clears the phone number. */
  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  showPhone?: boolean;

  /** Empty string clears the contact email. */
  @Field({ nullable: true })
  contactEmail?: string;
}
