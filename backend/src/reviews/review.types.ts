import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ReviewTargetType {
  SELLER = 'SELLER',
  SPECIALIST = 'SPECIALIST',
  SERVICE_CENTER = 'SERVICE_CENTER',
}

registerEnumType(ReviewTargetType, { name: 'ReviewTargetType' });

@ObjectType()
export class ReviewObject {
  @Field()
  id: string;

  @Field(() => Int)
  rating: number;

  @Field(() => String, { nullable: true })
  comment: string | null;

  /** Public display name of the author (first name + initial of the surname). */
  @Field()
  authorName: string;

  /** True for the signed-in user's own review. */
  @Field()
  mine: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ReviewListObject {
  @Field(() => [ReviewObject])
  items: ReviewObject[];

  @Field(() => Int)
  total: number;

  @Field()
  average: number;

  /** Number of reviews per star, index 0 = 1 star ... index 4 = 5 stars. */
  @Field(() => [Int])
  distribution: number[];
}

@InputType()
export class SubmitReviewInput {
  @Field(() => ReviewTargetType)
  targetType: ReviewTargetType;

  @Field()
  targetId: string;

  @Field(() => Int)
  rating: number;

  @Field(() => String, { nullable: true })
  comment?: string | null;
}
