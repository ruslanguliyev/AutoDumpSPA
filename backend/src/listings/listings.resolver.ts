import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import {
  CreateListingInput,
  ListingObject,
  ListingsFilterInput,
  PaginatedListings,
  UpdateListingInput,
} from './listing.types';
import { ListingsService } from './listings.service';

@Resolver(() => ListingObject)
export class ListingsResolver {
  constructor(private readonly listingsService: ListingsService) {}

  @Query(() => ListingObject)
  async listing(@Args('id') id: string): Promise<ListingObject> {
    return this.listingsService.getListing(id);
  }

  @Query(() => PaginatedListings)
  async listings(
    @Args('filter', { nullable: true }) filter?: ListingsFilterInput,
    @Args('page', { type: () => Int, defaultValue: 1 }) page = 1,
    @Args('perPage', { type: () => Int, defaultValue: 20 }) perPage = 20,
  ): Promise<PaginatedListings> {
    return this.listingsService.getListings(filter ?? {}, page, perPage);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ListingObject)
  async createListing(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreateListingInput,
  ): Promise<ListingObject> {
    return this.listingsService.createListing(user.id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ListingObject)
  async updateListing(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('input') input: UpdateListingInput,
  ): Promise<ListingObject> {
    return this.listingsService.updateListing(user.id, id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ListingObject)
  async publishListing(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
  ): Promise<ListingObject> {
    return this.listingsService.publishListing(user.id, id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ListingObject)
  async closeListing(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
  ): Promise<ListingObject> {
    return this.listingsService.closeListing(user.id, id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteListing(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.listingsService.deleteListing(user.id, id);
  }
}
