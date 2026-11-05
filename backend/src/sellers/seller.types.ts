import '../auth/auth.types';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
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

  @Field()
  rating: number;

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
}
