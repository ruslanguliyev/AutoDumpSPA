import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ImageObject {
  @Field()
  id: string;

  @Field()
  listingId: string;

  @Field()
  url: string;

  @Field(() => Int)
  position: number;
}
