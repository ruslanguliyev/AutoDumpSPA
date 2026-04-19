import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ServiceObject {
  @Field()
  id: string;

  @Field()
  listingId: string;

  @Field()
  name: string;

  @Field(() => [String])
  categories: string[];

  @Field(() => [String])
  supportedBrands: string[];

  @Field()
  city: string;

  @Field(() => Float)
  rating: number;
}

@InputType()
export class CreateServiceInput {
  @Field()
  name: string;

  @Field(() => [String])
  categories: string[];

  @Field(() => [String])
  supportedBrands: string[];

  @Field()
  city: string;

  @Field(() => Float)
  rating: number;
}

@InputType()
export class UpdateServiceInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => [String], { nullable: true })
  supportedBrands?: string[];

  @Field({ nullable: true })
  city?: string;

  @Field(() => Float, { nullable: true })
  rating?: number;
}
