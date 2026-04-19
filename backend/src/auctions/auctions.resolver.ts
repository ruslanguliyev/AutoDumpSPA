import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { AuctionObject, CreateAuctionInput } from './auction.types';
import { AuctionsService } from './auctions.service';

@Resolver(() => AuctionObject)
export class AuctionsResolver {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Query(() => AuctionObject)
  async auction(@Args('id') id: string): Promise<AuctionObject> {
    return this.auctionsService.getAuction(id);
  }

  @Query(() => AuctionObject, { nullable: true })
  async auctionByListing(
    @Args('listingId') listingId: string,
  ): Promise<AuctionObject | null> {
    return this.auctionsService.getAuctionByListingId(listingId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AuctionObject)
  async createAuction(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreateAuctionInput,
  ): Promise<AuctionObject> {
    return this.auctionsService.createAuction(user.id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AuctionObject)
  async startAuction(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
  ): Promise<AuctionObject> {
    return this.auctionsService.startAuction(user.id, id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => AuctionObject)
  async finishAuction(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
  ): Promise<AuctionObject> {
    return this.auctionsService.finishAuction(user.id, id);
  }
}
