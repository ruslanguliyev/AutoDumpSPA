import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';

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

  @Field(() => Int)
  year: number;

  @Field(() => Int)
  mileage: number;

  @Field()
  fuel: string;

  @Field()
  transmission: string;

  @Field(() => Float)
  engineVolume: number;

  @Field(() => Int)
  power: number;
}

@InputType()
export class CreateVehicleInput {
  @Field()
  brand: string;

  @Field()
  model: string;

  @Field(() => Int)
  year: number;

  @Field(() => Int)
  mileage: number;

  @Field()
  fuel: string;

  @Field()
  transmission: string;

  @Field(() => Float)
  engineVolume: number;

  @Field(() => Int)
  power: number;
}

@InputType()
export class UpdateVehicleInput {
  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  model?: string;

  @Field(() => Int, { nullable: true })
  year?: number;

  @Field(() => Int, { nullable: true })
  mileage?: number;

  @Field({ nullable: true })
  fuel?: string;

  @Field({ nullable: true })
  transmission?: string;

  @Field(() => Float, { nullable: true })
  engineVolume?: number;

  @Field(() => Int, { nullable: true })
  power?: number;
}
