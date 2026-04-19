import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { BidObject, PlaceBidInput } from './bid.types';
import { BidsService } from './bids.service';

@Resolver(() => BidObject)
export class BidsResolver {
  constructor(private readonly bidsService: BidsService) {}

  @Query(() => [BidObject])
  async bidsByAuction(
    @Args('auctionId') auctionId: string,
  ): Promise<BidObject[]> {
    return this.bidsService.getBidsByAuction(auctionId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [BidObject])
  async myBids(@CurrentUser() user: AuthUser): Promise<BidObject[]> {
    return this.bidsService.getMyBids(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => BidObject)
  async placeBid(
    @CurrentUser() user: AuthUser,
    @Args('input') input: PlaceBidInput,
  ): Promise<BidObject> {
    return this.bidsService.placeBid(user.id, input);
  }
}
