import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FavoriteItemObject {
  @Field()
  type: string;

  @Field()
  itemId: string;

  @Field()
  title: string;

  @Field(() => Float, { nullable: true })
  price?: number | null;

  @Field({ nullable: true })
  currency?: string | null;

  @Field({ nullable: true })
  thumbnail?: string | null;

  @Field()
  createdAt: Date;
}

@InputType()
export class FavoriteRefInput {
  /** 'vehicle' | 'part' */
  @Field()
  type: string;

  @Field()
  itemId: string;
}
