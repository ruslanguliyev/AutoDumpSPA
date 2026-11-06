import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ListingPurpose } from '@prisma/client';
import { PromotionTier } from '../promotions/promotion.types';

@ObjectType()
export class VehicleSellerObject {
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
export class RentalTermsObject {
  @Field(() => Float, { nullable: true })
  deposit?: number | null;

  @Field(() => Int)
  minDays: number;

  @Field(() => Int, { nullable: true })
  maxDays?: number | null;

  /** Included kilometres per day; null means unlimited. */
  @Field(() => Int, { nullable: true })
  kmPerDay?: number | null;

  @Field(() => Int, { nullable: true })
  minDriverAge?: number | null;
}

@ObjectType()
export class VehicleObject {
  @Field()
  id: string;

  @Field()
  listingId: string;

  @Field()
  brand: string;

  @Field()
  model: string;

  @Field({ nullable: true })
  generation: string | null;

  @Field({ nullable: true })
  version: string | null;

  @Field(() => Int)
  year: number;

  @Field(() => Int)
  mileage: number;

  @Field()
  fuel: string;

  @Field()
  transmission: string;

  @Field({ nullable: true })
  displacement: string | null;

  @Field({ nullable: true })
  horsepower: string | null;

  @Field(() => Float)
  engineVolume: number;

  @Field(() => Int)
  power: number;

  @Field({ nullable: true })
  drive: string | null;

  @Field()
  condition: string;

  @Field({ nullable: true })
  color: string | null;

  @Field()
  vehicleType: string;

  @Field(() => ListingPurpose)
  purpose: ListingPurpose;

  /** Rental conditions; only set for rental listings. */
  @Field(() => RentalTermsObject, { nullable: true })
  rental?: RentalTermsObject | null;

  /** Body style: sedan, suv, coupe ... (null for older listings). */
  @Field({ nullable: true })
  bodyType?: string | null;

  @Field(() => Float, { nullable: true })
  price: number | null;

  @Field()
  currency: string;

  @Field({ nullable: true })
  location: string | null;

  @Field({ nullable: true })
  description: string | null;

  @Field(() => [String])
  imageUrls: string[];

  @Field()
  isHot: boolean;

  @Field()
  isCreditAvailable: boolean;

  @Field()
  isBarterAvailable: boolean;

  @Field()
  hasDamage: boolean;

  @Field()
  isRepainted: boolean;

  @Field()
  wasInAccident: boolean;

  @Field(() => Int)
  ownersCount: number;

  @Field(() => Int, { nullable: true })
  seatsCount: number | null;

  @Field({ nullable: true })
  marketRegion: string | null;

  @Field(() => VehicleSellerObject, { nullable: true })
  seller: VehicleSellerObject | null;

  /** VIP or PREMIUM while the listing holds paid placement, otherwise null. */
  @Field(() => PromotionTier, { nullable: true })
  promotionTier: PromotionTier | null;

  /** How many times the detail page was opened. */
  @Field(() => Int)
  viewsCount: number;
}

@ObjectType()
export class PaginatedVehicles {
  @Field(() => [VehicleObject])
  items: VehicleObject[];

  @Field(() => Int)
  total: number;
}

@InputType()
export class VehiclesFilterInput {
  /** SALE (default for search) or RENT. */
  @Field(() => ListingPurpose, { nullable: true })
  purpose?: ListingPurpose;

  /** Rental search: only cars free for the whole period (YYYY-MM-DD). */
  @Field({ nullable: true })
  availableFrom?: string;

  @Field({ nullable: true })
  availableTo?: string;

  /** Only vehicles of this seller. */
  @Field({ nullable: true })
  sellerId?: string;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  model?: string;

  @Field(() => Int, { nullable: true })
  yearFrom?: number;

  @Field(() => Int, { nullable: true })
  yearTo?: number;

  @Field(() => Float, { nullable: true })
  priceFrom?: number;

  @Field(() => Float, { nullable: true })
  priceTo?: number;

  @Field({ nullable: true })
  condition?: string;

  @Field({ nullable: true })
  fuel?: string;

  @Field({ nullable: true })
  transmission?: string;

  @Field({ nullable: true })
  vehicleType?: string;

  @Field({ nullable: true })
  location?: string;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}

@InputType()
export class CreateVehicleInput {
  @Field()
  brand: string;

  @Field()
  model: string;

  @Field({ nullable: true })
  generation?: string;

  @Field(() => Int)
  year: number;

  @Field(() => Int)
  mileage: number;

  @Field()
  fuel: string;

  @Field()
  transmission: string;

  @Field({ nullable: true })
  displacement?: string;

  @Field({ nullable: true })
  horsepower?: string;

  @Field(() => Float)
  engineVolume: number;

  @Field(() => Int)
  power: number;

  @Field({ nullable: true })
  version?: string;

  @Field({ nullable: true })
  drive?: string;

  @Field({ nullable: true })
  condition?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  vehicleType?: string;

  @Field({ nullable: true })
  bodyType?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  imageUrls?: string[];

  @Field({ nullable: true })
  isHot?: boolean;

  @Field({ nullable: true })
  isCreditAvailable?: boolean;

  @Field({ nullable: true })
  isBarterAvailable?: boolean;

  @Field({ nullable: true })
  hasDamage?: boolean;

  @Field({ nullable: true })
  isRepainted?: boolean;

  @Field({ nullable: true })
  wasInAccident?: boolean;

  @Field(() => Int, { nullable: true })
  ownersCount?: number;

  @Field(() => Int, { nullable: true })
  seatsCount?: number;

  @Field({ nullable: true })
  marketRegion?: string;
}

@InputType()
export class UpdateVehicleInput {
  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  generation?: string;

  @Field(() => Int, { nullable: true })
  year?: number;

  @Field(() => Int, { nullable: true })
  mileage?: number;

  @Field({ nullable: true })
  fuel?: string;

  @Field({ nullable: true })
  transmission?: string;

  @Field({ nullable: true })
  displacement?: string;

  @Field({ nullable: true })
  horsepower?: string;

  @Field(() => Float, { nullable: true })
  engineVolume?: number;

  @Field(() => Int, { nullable: true })
  power?: number;

  @Field({ nullable: true })
  version?: string;

  @Field({ nullable: true })
  drive?: string;

  @Field({ nullable: true })
  condition?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  vehicleType?: string;

  @Field({ nullable: true })
  bodyType?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  imageUrls?: string[];

  @Field({ nullable: true })
  isHot?: boolean;

  @Field({ nullable: true })
  isCreditAvailable?: boolean;

  @Field({ nullable: true })
  isBarterAvailable?: boolean;

  @Field({ nullable: true })
  hasDamage?: boolean;

  @Field({ nullable: true })
  isRepainted?: boolean;

  @Field({ nullable: true })
  wasInAccident?: boolean;

  @Field(() => Int, { nullable: true })
  ownersCount?: number;

  @Field(() => Int, { nullable: true })
  seatsCount?: number;

  @Field({ nullable: true })
  marketRegion?: string;
}
