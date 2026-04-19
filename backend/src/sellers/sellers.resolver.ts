import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CreateSellerInput, SellerObject, UpdateSellerInput } from './seller.types';
import { SellersService } from './sellers.service';

@Resolver(() => SellerObject)
export class SellersResolver {
  constructor(private readonly sellersService: SellersService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => SellerObject, { nullable: true })
  async mySeller(@CurrentUser() user: AuthUser): Promise<SellerObject | null> {
    return this.sellersService.getSellerByUserId(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SellerObject)
  async createSeller(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreateSellerInput,
  ): Promise<SellerObject> {
    return this.sellersService.createSeller(user.id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SellerObject)
  async updateSeller(
    @CurrentUser() user: AuthUser,
    @Args('input') input: UpdateSellerInput,
  ): Promise<SellerObject> {
    return this.sellersService.updateSeller(user.id, input);
  }
}
