import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PartObject {
  @Field()
  id: string;

  @Field()
  listingId: string;

  @Field()
  name: string;

  @Field()
  category: string;

  @Field()
  brand: string;

  @Field()
  model: string;

  @Field()
  condition: string;

  @Field()
  oemCode: string;

  @Field(() => Int)
  stock: number;
}

@InputType()
export class CreatePartInput {
  @Field()
  name: string;

  @Field()
  category: string;

  @Field()
  brand: string;

  @Field()
  model: string;

  @Field()
  condition: string;

  @Field()
  oemCode: string;

  @Field(() => Int)
  stock: number;
}

@InputType()
export class UpdatePartInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  condition?: string;

  @Field({ nullable: true })
  oemCode?: string;

  @Field(() => Int, { nullable: true })
  stock?: number;
}
