import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class ServiceCenterServiceObject {
  @Field()
  id: string;

  @Field()
  serviceCenterId: string;

  @Field()
  code: string;

  @Field()
  title: string;

  @Field()
  category: string;

  @Field(() => Float, { nullable: true })
  priceFrom: number | null;

  @Field(() => Float, { nullable: true })
  priceTo: number | null;

  @Field()
  currency: string;

  @Field(() => Int, { nullable: true })
  durationMin: number | null;

  @Field(() => [String])
  applicableBrands: string[];

  @Field()
  popular: boolean;
}

@ObjectType()
export class ServiceCenterObject {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  slug: string | null;

  @Field({ nullable: true })
  description: string | null;

  @Field({ nullable: true })
  legalName: string | null;

  @Field({ nullable: true })
  type: string | null;

  @Field()
  city: string;

  @Field({ nullable: true })
  address: string | null;

  @Field({ nullable: true })
  phone: string | null;

  @Field({ nullable: true })
  whatsapp: string | null;

  @Field({ nullable: true })
  website: string | null;

  @Field({ nullable: true })
  logoUrl: string | null;

  @Field({ nullable: true })
  coverImage: string | null;

  @Field(() => [String])
  gallery: string[];

  @Field(() => [String])
  categories: string[];

  @Field(() => [String])
  supportedBrands: string[];

  @Field(() => Float)
  rating: number;

  @Field(() => Int)
  reviewsCount: number;

  @Field()
  verified: boolean;

  @Field()
  isActive: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  schedule: Record<string, unknown> | null;

  @Field(() => GraphQLJSON, { nullable: true })
  contacts: Record<string, unknown> | null;

  @Field(() => [ServiceCenterServiceObject])
  services: ServiceCenterServiceObject[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateServiceCenterServiceInput {
  @Field()
  code: string;

  @Field()
  title: string;

  @Field()
  category: string;

  @Field(() => Float, { nullable: true })
  priceFrom?: number;

  @Field(() => Float, { nullable: true })
  priceTo?: number;

  @Field({ nullable: true })
  currency?: string;

  @Field(() => Int, { nullable: true })
  durationMin?: number;

  @Field(() => [String], { nullable: true })
  applicableBrands?: string[];

  @Field({ nullable: true })
  popular?: boolean;
}

@InputType()
export class CreateServiceCenterInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  legalName?: string;

  @Field({ nullable: true })
  type?: string;

  @Field()
  city: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  whatsapp?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => [String], { nullable: true })
  gallery?: string[];

  @Field(() => [String])
  categories: string[];

  @Field(() => [String], { nullable: true })
  supportedBrands?: string[];

  @Field({ nullable: true })
  verified?: boolean;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  schedule?: Record<string, unknown>;

  @Field(() => GraphQLJSON, { nullable: true })
  contacts?: Record<string, unknown>;

  @Field(() => [CreateServiceCenterServiceInput], { nullable: true })
  services?: CreateServiceCenterServiceInput[];
}

@InputType()
export class UpdateServiceCenterInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  legalName?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  whatsapp?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => [String], { nullable: true })
  gallery?: string[];

  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => [String], { nullable: true })
  supportedBrands?: string[];

  @Field({ nullable: true })
  verified?: boolean;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  schedule?: Record<string, unknown>;

  @Field(() => GraphQLJSON, { nullable: true })
  contacts?: Record<string, unknown>;

  @Field(() => [CreateServiceCenterServiceInput], { nullable: true })
  services?: CreateServiceCenterServiceInput[];
}
