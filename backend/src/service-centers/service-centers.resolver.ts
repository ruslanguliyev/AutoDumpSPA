import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import {
  CreateServiceCenterInput,
  ServiceCenterObject,
  UpdateServiceCenterInput,
} from './service-center.types';
import { ServiceCentersService } from './service-centers.service';

@Resolver(() => ServiceCenterObject)
export class ServiceCentersResolver {
  constructor(private readonly serviceCentersService: ServiceCentersService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => ServiceCenterObject, { nullable: true })
  async myServiceCenter(
    @CurrentUser() user: AuthUser,
  ): Promise<ServiceCenterObject | null> {
    return this.serviceCentersService.getServiceCenterByUserId(user.id);
  }

  @Query(() => ServiceCenterObject)
  async serviceCenter(@Args('id') id: string): Promise<ServiceCenterObject> {
    return this.serviceCentersService.getServiceCenterById(id);
  }

  @Query(() => ServiceCenterObject, { nullable: true })
  async serviceCenterBySlug(
    @Args('slug') slug: string,
  ): Promise<ServiceCenterObject | null> {
    return this.serviceCentersService.getServiceCenterBySlug(slug);
  }

  @Query(() => [ServiceCenterObject])
  async serviceCenters(
    @Args('city', { type: () => String, nullable: true }) city?: string | null,
  ): Promise<ServiceCenterObject[]> {
    return this.serviceCentersService.getServiceCenters(city ?? undefined);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ServiceCenterObject)
  async createServiceCenter(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreateServiceCenterInput,
  ): Promise<ServiceCenterObject> {
    return this.serviceCentersService.createServiceCenter(user.id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ServiceCenterObject)
  async updateServiceCenter(
    @CurrentUser() user: AuthUser,
    @Args('input') input: UpdateServiceCenterInput,
  ): Promise<ServiceCenterObject> {
    return this.serviceCentersService.updateServiceCenter(user.id, input);
  }
}
