import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BidObject {
  @Field()
  id: string;

  @Field()
  auctionId: string;

  @Field()
  userId: string;

  @Field(() => Float)
  amount: number;

  @Field()
  createdAt: Date;
}

@InputType()
export class PlaceBidInput {
  @Field()
  auctionId: string;

  @Field(() => Float)
  amount: number;
}
