import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { RentalsService } from './rentals.service';
import {
  RentalBlockObject,
  RentalBookingObject,
  RentalTermsInput,
  RequestRentalInput,
  UnavailableRangeObject,
} from './rental.types';

@Resolver()
export class RentalsResolver {
  constructor(private readonly rentalsService: RentalsService) {}

  /** Public: which days of a rental car cannot be booked. */
  @Query(() => [UnavailableRangeObject])
  rentalAvailability(
    @Args('listingId') listingId: string,
    @Args('from', { nullable: true }) from?: string,
    @Args('to', { nullable: true }) to?: string,
  ) {
    return this.rentalsService.availability(listingId, from, to);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  setRentalTerms(
    @CurrentUser() user: AuthUser,
    @Args('listingId') listingId: string,
    @Args('input') input: RentalTermsInput,
  ) {
    return this.rentalsService.setTerms(user.id, listingId, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RentalBookingObject)
  requestRental(@CurrentUser() user: AuthUser, @Args('input') input: RequestRentalInput) {
    return this.rentalsService.request(user.id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RentalBookingObject)
  decideRental(@CurrentUser() user: AuthUser, @Args('id') id: string, @Args('confirm') confirm: boolean) {
    return this.rentalsService.decide(user.id, id, confirm);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RentalBookingObject)
  cancelRental(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.rentalsService.cancel(user.id, id);
  }

  /** Requests for my cars. */
  @UseGuards(GqlAuthGuard)
  @Query(() => [RentalBookingObject])
  incomingRentals(@CurrentUser() user: AuthUser) {
    return this.rentalsService.incoming(user.id);
  }

  /** Cars I have booked. */
  @UseGuards(GqlAuthGuard)
  @Query(() => [RentalBookingObject])
  myRentals(@CurrentUser() user: AuthUser) {
    return this.rentalsService.mine(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Int)
  pendingRentalRequestsCount(@CurrentUser() user: AuthUser) {
    return this.rentalsService.pendingCount(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [RentalBlockObject])
  rentalBlocks(@CurrentUser() user: AuthUser, @Args('listingId') listingId: string) {
    return this.rentalsService.blocks(user.id, listingId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => RentalBlockObject)
  addRentalBlock(
    @CurrentUser() user: AuthUser,
    @Args('listingId') listingId: string,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('note', { nullable: true }) note?: string,
  ) {
    return this.rentalsService.addBlock(user.id, listingId, startDate, endDate, note);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  removeRentalBlock(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.rentalsService.removeBlock(user.id, id);
  }
}
