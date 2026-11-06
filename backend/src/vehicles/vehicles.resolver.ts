import { UseGuards } from '@nestjs/common';
import { ListingPurpose, PromotionTier } from '@prisma/client';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { OptionalGqlAuthGuard } from '../common/guards/optional-gql-auth.guard';
import {
  CreateVehicleInput,
  PaginatedVehicles,
  UpdateVehicleInput,
  VehicleObject,
  VehiclesFilterInput,
} from './vehicle.types';
import { VehiclesService } from './vehicles.service';

@Resolver(() => VehicleObject)
export class VehiclesResolver {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Query(() => PaginatedVehicles)
  async vehicles(
    @Args('filter', { type: () => VehiclesFilterInput, nullable: true })
    filter?: VehiclesFilterInput | null,
  ): Promise<PaginatedVehicles> {
    return this.vehiclesService.getVehicles(filter ?? undefined);
  }

  /**
   * The promoted block shown above the catalogue, or on the home page when `tier` is
   * PREMIUM. Clearly separate from the ranked results, and always labelled as paid.
   */
  @Query(() => [VehicleObject])
  async promotedVehicles(
    @Args('tier', { type: () => PromotionTier, nullable: true }) tier?: PromotionTier | null,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number | null,
    @Args('purpose', { type: () => ListingPurpose, nullable: true }) purpose?: ListingPurpose | null,
  ): Promise<VehicleObject[]> {
    return this.vehiclesService.getPromotedVehicles(
      tier ?? PromotionTier.VIP,
      limit ?? 6,
      purpose ?? ListingPurpose.SALE,
    );
  }

  @Query(() => VehicleObject)
  async vehicleById(@Args('id') id: string): Promise<VehicleObject> {
    return this.vehiclesService.getVehicleById(id);
  }

  @UseGuards(OptionalGqlAuthGuard)
  @Query(() => VehicleObject, { nullable: true })
  async vehicleByListing(
    @CurrentUser() user: AuthUser | null,
    @Args('listingId') listingId: string,
  ): Promise<VehicleObject | null> {
    return this.vehiclesService.getVehicleByListingId(listingId, user?.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => VehicleObject)
  async createVehicle(
    @CurrentUser() user: AuthUser,
    @Args('listingId') listingId: string,
    @Args('input') input: CreateVehicleInput,
  ): Promise<VehicleObject> {
    return this.vehiclesService.createVehicle(user.id, listingId, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => VehicleObject)
  async updateVehicle(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('input') input: UpdateVehicleInput,
  ): Promise<VehicleObject> {
    return this.vehiclesService.updateVehicle(user.id, id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteVehicle(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.vehiclesService.deleteVehicle(user.id, id);
  }
}
