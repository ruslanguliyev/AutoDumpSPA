import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PartSellerObject {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field()
  hasPublicPage: boolean;

  @Field()
  verified: boolean;

  @Field(() => Float)
  rating: number;

  @Field()
  city: string;

  /** Null unless the seller chose to show the phone number publicly. */
  @Field({ nullable: true })
  phone?: string | null;

  @Field({ nullable: true })
  logo: string | null;
}

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

  @Field({ nullable: true })
  oemCode: string | null;

  @Field(() => Int)
  stock: number;

  @Field({ nullable: true })
  description: string | null;

  @Field(() => Float, { nullable: true })
  price: number | null;

  @Field()
  currency: string;

  @Field({ nullable: true })
  imageUrl: string | null;

  @Field(() => [String])
  compatibility: string[];

  @Field({ nullable: true })
  location: string | null;

  @Field(() => PartSellerObject, { nullable: true })
  seller: PartSellerObject | null;
}

@ObjectType()
export class PaginatedParts {
  @Field(() => [PartObject])
  items: PartObject[];

  @Field(() => Int)
  total: number;
}

@InputType()
export class PartsFilterInput {
  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  condition?: string;

  @Field(() => Float, { nullable: true })
  priceFrom?: number;

  @Field(() => Float, { nullable: true })
  priceTo?: number;

  @Field({ nullable: true })
  location?: string;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
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

  @Field({ nullable: true })
  oemCode?: string;

  @Field(() => Int)
  stock: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => [String], { nullable: true })
  compatibility?: string[];

  @Field({ nullable: true })
  location?: string;
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

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => [String], { nullable: true })
  compatibility?: string[];

  @Field({ nullable: true })
  location?: string;
}
