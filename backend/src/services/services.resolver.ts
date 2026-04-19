import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import {
  CreateServiceInput,
  ServiceObject,
  UpdateServiceInput,
} from './service.types';
import { ServicesService } from './services.service';

@Resolver(() => ServiceObject)
export class ServicesResolver {
  constructor(private readonly servicesService: ServicesService) {}

  @Query(() => ServiceObject, { nullable: true })
  async serviceByListing(
    @Args('listingId') listingId: string,
  ): Promise<ServiceObject | null> {
    return this.servicesService.getServiceByListingId(listingId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ServiceObject)
  async createService(
    @CurrentUser() user: AuthUser,
    @Args('listingId') listingId: string,
    @Args('input') input: CreateServiceInput,
  ): Promise<ServiceObject> {
    return this.servicesService.createService(user.id, listingId, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ServiceObject)
  async updateService(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('input') input: UpdateServiceInput,
  ): Promise<ServiceObject> {
    return this.servicesService.updateService(user.id, id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteService(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.servicesService.deleteService(user.id, id);
  }
}
