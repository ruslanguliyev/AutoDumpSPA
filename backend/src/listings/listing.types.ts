import '../auth/auth.types';
import { Field, Float, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ListingStatus } from '@prisma/client';

const globalWithEnums = globalThis as typeof globalThis & {
  __listingStatusRegistered?: boolean;
};

if (!globalWithEnums.__listingStatusRegistered) {
  registerEnumType(ListingStatus, {
    name: 'ListingStatus',
    description: 'Listing status enum',
  });
  globalWithEnums.__listingStatusRegistered = true;
}

@ObjectType()
export class ListingObject {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field(() => ListingStatus)
  status: ListingStatus;

  @Field()
  sellerId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateListingInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;
}

@InputType()
export class UpdateListingInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  price?: number;
}

@InputType()
export class ListingsFilterInput {
  @Field(() => ListingStatus, { nullable: true })
  status?: ListingStatus;

  @Field({ nullable: true })
  sellerId?: string;

  @Field(() => Float, { nullable: true })
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  maxPrice?: number;
}

@ObjectType()
export class PaginatedListings {
  @Field(() => [ListingObject])
  items: ListingObject[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  perPage: number;
}
