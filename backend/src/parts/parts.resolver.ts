import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import {
  CreatePartInput,
  PaginatedParts,
  PartObject,
  PartsFilterInput,
  UpdatePartInput,
} from './part.types';
import { PartsService } from './parts.service';

@Resolver(() => PartObject)
export class PartsResolver {
  constructor(private readonly partsService: PartsService) {}

  @Query(() => PaginatedParts)
  async parts(
    @Args('filter', { type: () => PartsFilterInput, nullable: true })
    filter?: PartsFilterInput | null,
  ): Promise<PaginatedParts> {
    return this.partsService.getParts(filter ?? undefined);
  }

  @Query(() => PartObject)
  async partById(@Args('id') id: string): Promise<PartObject> {
    return this.partsService.getPartById(id);
  }

  @Query(() => PartObject, { nullable: true })
  async partByListing(
    @Args('listingId') listingId: string,
  ): Promise<PartObject | null> {
    return this.partsService.getPartByListingId(listingId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PartObject)
  async createPart(
    @CurrentUser() user: AuthUser,
    @Args('listingId') listingId: string,
    @Args('input') input: CreatePartInput,
  ): Promise<PartObject> {
    return this.partsService.createPart(user.id, listingId, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PartObject)
  async updatePart(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
    @Args('input') input: UpdatePartInput,
  ): Promise<PartObject> {
    return this.partsService.updatePart(user.id, id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deletePart(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.partsService.deletePart(user.id, id);
  }
}
