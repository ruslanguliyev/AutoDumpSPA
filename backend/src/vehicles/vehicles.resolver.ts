import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CreateVehicleInput, UpdateVehicleInput, VehicleObject } from './vehicle.types';
import { VehiclesService } from './vehicles.service';

@Resolver(() => VehicleObject)
export class VehiclesResolver {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Query(() => VehicleObject, { nullable: true })
  async vehicleByListing(
    @Args('listingId') listingId: string,
  ): Promise<VehicleObject | null> {
    return this.vehiclesService.getVehicleByListingId(listingId);
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
