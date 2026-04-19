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
}

@InputType()
export class UpdateSellerInput {
  @Field(() => SellerType, { nullable: true })
  type?: SellerType;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  city?: string;
}
