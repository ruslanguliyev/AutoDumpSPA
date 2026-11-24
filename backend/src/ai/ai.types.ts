import { Field, Float, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum AiLanguage {
  AZ = 'AZ',
  RU = 'RU',
  EN = 'EN',
}

export enum DescriptionTone {
  NEUTRAL = 'NEUTRAL',
  SALES = 'SALES',
  SHORT = 'SHORT',
}

export enum DescriptionMode {
  GENERATE = 'GENERATE',
  REGENERATE = 'REGENERATE',
  SHORTER = 'SHORTER',
  LONGER = 'LONGER',
}

registerEnumType(AiLanguage, { name: 'AiLanguage' });
registerEnumType(DescriptionTone, { name: 'DescriptionTone' });
registerEnumType(DescriptionMode, { name: 'DescriptionMode' });

@InputType()
export class GenerateListingDescriptionInput {
  @Field()
  brand: string;

  @Field()
  model: string;

  @Field({ nullable: true })
  generation?: string;

  @Field({ nullable: true })
  trim?: string;

  @Field(() => Int)
  year: number;

  @Field(() => Int, { nullable: true })
  mileage?: number;

  @Field(() => Float, { nullable: true })
  engineVolume?: number;

  @Field(() => Int, { nullable: true })
  horsepower?: number;

  @Field({ nullable: true })
  transmission?: string;

  @Field({ nullable: true })
  fuel?: string;

  @Field({ nullable: true })
  bodyType?: string;

  @Field({ nullable: true })
  condition?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  currentText?: string;

  @Field(() => DescriptionTone)
  tone: DescriptionTone;

  @Field(() => AiLanguage)
  language: AiLanguage;

  @Field(() => DescriptionMode)
  mode: DescriptionMode;
}

@ObjectType()
export class GenerateListingDescriptionResult {
  @Field()
  text: string;

  @Field(() => [String])
  usedFields: string[];

  @Field(() => [String])
  missingHints: string[];
}

/** Same filter fields VehiclesFilterInput accepts for the smart-search subset. */
@ObjectType()
export class ParsedVehicleSearchFilters {
  @Field({ nullable: true })
  brand?: string | null;

  @Field({ nullable: true })
  model?: string | null;

  @Field(() => Int, { nullable: true })
  yearFrom?: number | null;

  @Field(() => Int, { nullable: true })
  yearTo?: number | null;

  @Field(() => Float, { nullable: true })
  priceFrom?: number | null;

  @Field(() => Float, { nullable: true })
  priceTo?: number | null;

  @Field({ nullable: true })
  condition?: string | null;

  @Field({ nullable: true })
  fuel?: string | null;

  @Field({ nullable: true })
  transmission?: string | null;

  @Field({ nullable: true })
  location?: string | null;
}

@ObjectType()
export class ParsedVehicleSearch {
  @Field(() => ParsedVehicleSearchFilters)
  filters: ParsedVehicleSearchFilters;

  @Field(() => [String])
  unapplied: string[];
}

@ObjectType()
export class AiStatus {
  @Field()
  enabled: boolean;
}
