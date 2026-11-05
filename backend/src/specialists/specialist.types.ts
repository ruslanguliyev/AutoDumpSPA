import {
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';

@ObjectType()
export class SpecialistVehicleObject {
  @Field()
  id: string;

  @Field()
  specialistId: string;

  @Field()
  brand: string;

  @Field()
  model: string;

  @Field(() => Int, { nullable: true })
  yearFrom: number | null;

  @Field(() => Int, { nullable: true })
  yearTo: number | null;
}

@ObjectType()
export class SpecialistObject {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  bio: string | null;

  @Field()
  city: string;

  @Field({ nullable: true })
  phone: string | null;

  @Field({ nullable: true })
  whatsapp: string | null;

  @Field({ nullable: true })
  avatarUrl: string | null;

  @Field({ nullable: true })
  coverImage: string | null;

  @Field(() => [String])
  skills: string[];

  @Field(() => [String])
  specializations: string[];

  @Field(() => Int)
  experience: number;

  @Field(() => Float)
  rating: number;

  @Field(() => Int)
  reviewsCount: number;

  @Field(() => Float, { nullable: true })
  hourlyRate: number | null;

  @Field(() => Float, { nullable: true })
  priceFrom: number | null;

  @Field()
  mobileService: boolean;

  @Field(() => [String])
  portfolio: string[];

  @Field()
  verified: boolean;

  @Field()
  available: boolean;

  @Field(() => [SpecialistVehicleObject])
  supportedVehicles: SpecialistVehicleObject[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateSpecialistVehicleInput {
  @Field()
  brand: string;

  @Field()
  model: string;

  @Field(() => Int, { nullable: true })
  yearFrom?: number;

  @Field(() => Int, { nullable: true })
  yearTo?: number;
}

@InputType()
export class CreateSpecialistInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  bio?: string;

  @Field()
  city: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  whatsapp?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => [String])
  skills: string[];

  @Field(() => [String])
  specializations: string[];

  @Field(() => Int)
  experience: number;

  @Field(() => Float, { nullable: true })
  hourlyRate?: number;

  @Field(() => Float, { nullable: true })
  priceFrom?: number;

  @Field({ nullable: true })
  mobileService?: boolean;

  @Field(() => [String])
  portfolio: string[];

  @Field(() => [CreateSpecialistVehicleInput], { nullable: true })
  supportedVehicles?: CreateSpecialistVehicleInput[];
}

@InputType()
export class UpdateSpecialistInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  whatsapp?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field(() => [String], { nullable: true })
  specializations?: string[];

  @Field(() => Int, { nullable: true })
  experience?: number;

  @Field(() => Float, { nullable: true })
  hourlyRate?: number;

  @Field(() => Float, { nullable: true })
  priceFrom?: number;

  @Field({ nullable: true })
  mobileService?: boolean;

  @Field(() => [String], { nullable: true })
  portfolio?: string[];

  @Field({ nullable: true })
  available?: boolean;

  @Field(() => [CreateSpecialistVehicleInput], { nullable: true })
  supportedVehicles?: CreateSpecialistVehicleInput[];
}

@InputType()
export class SpecialistsFilterInput {
  @Field({ nullable: true })
  city?: string;

  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Field(() => [String], { nullable: true })
  specializations?: string[];

  @Field(() => Float, { nullable: true })
  minRating?: number;

  @Field({ nullable: true })
  available?: boolean;
}
