import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuctionObject {
  @Field()
  id: string;

  @Field()
  listingId: string;

  @Field(() => Float)
  startPrice: number;

  @Field(() => Float)
  currentPrice: number;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field()
  status: string;
}

@InputType()
export class CreateAuctionInput {
  @Field()
  listingId: string;

  @Field(() => Float)
  startPrice: number;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;
}

@InputType()
export class UpdateAuctionInput {
  @Field({ nullable: true })
  startTime?: Date;

  @Field({ nullable: true })
  endTime?: Date;

  @Field(() => Float, { nullable: true })
  startPrice?: number;
}
