import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PromotionTarget, PromotionTier } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { OptionalGqlAuthGuard } from '../common/guards/optional-gql-auth.guard';
import {
  AdminPromotionObject,
  CreatePromotionOrderInput,
  PromotionObject,
  PromotionOrderObject,
  PromotionQuoteObject,
} from './promotion.types';
import { PromotionsService } from './promotions.service';

interface GqlContext {
  req?: { ip?: string };
}

/**
 * Who is asking, for the per-caller budgets. Express resolves this through the
 * `trust proxy` setting, so a client cannot claim an address that is not its own.
 */
function clientKey(context: GqlContext): string {
  return context?.req?.ip || 'unknown';
}

@Resolver()
export class PromotionsResolver {
  constructor(private readonly promotions: PromotionsService) {}

  /** Prices for one listing or profile, with any upgrade credit already taken off. */
  @Query(() => PromotionQuoteObject)
  promotionQuote(
    @Args('targetType', { type: () => PromotionTarget }) targetType: PromotionTarget,
    @Args('targetId') targetId: string,
  ) {
    return this.promotions.quote({ targetType, targetId });
  }

  /**
   * Starts a checkout. Signing in is not required: anybody may pay to promote a
   * listing, exactly as on turbo.az. Paying grants no rights over the listing.
   */
  @UseGuards(OptionalGqlAuthGuard)
  @Mutation(() => PromotionOrderObject)
  createPromotionOrder(
    @CurrentUser() user: AuthUser | undefined,
    @Args('input') input: CreatePromotionOrderInput,
    @Context() context: GqlContext,
  ) {
    return this.promotions.createOrder(input, user?.id, clientKey(context));
  }

  /** The status page. The token is the secret, so there is nothing else to check. */
  @Query(() => PromotionOrderObject)
  promotionOrder(@Args('token') token: string) {
    return this.promotions.orderByToken(token);
  }

  @Mutation(() => Boolean)
  cancelPromotionOrder(@Args('token') token: string) {
    return this.promotions.cancelOrder(token);
  }

  /** Counts an opened page, so the buyer can see what the placement brought in. */
  @Mutation(() => Boolean)
  trackPromotionView(
    @Args('targetType', { type: () => PromotionTarget }) targetType: PromotionTarget,
    @Args('targetId') targetId: string,
    @Context() context: GqlContext,
  ) {
    return this.promotions.track({ targetType, targetId }, 'view', clientKey(context));
  }

  /** Counts a revealed phone number or a started message. */
  @Mutation(() => Boolean)
  trackPromotionContact(
    @Args('targetType', { type: () => PromotionTarget }) targetType: PromotionTarget,
    @Args('targetId') targetId: string,
    @Context() context: GqlContext,
  ) {
    return this.promotions.track({ targetType, targetId }, 'contact', clientKey(context));
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [PromotionObject])
  myPromotions(@CurrentUser() user: AuthUser) {
    return this.promotions.myPromotions(user.id);
  }

  @UseGuards(AdminGuard)
  @Query(() => [AdminPromotionObject])
  adminPromotions(
    @Args('activeOnly', { type: () => Boolean, nullable: true }) activeOnly?: boolean,
  ) {
    return this.promotions.adminPromotions(activeOnly ?? true);
  }

  /** Gives a placement away: a compensation, a trial, or a deal agreed off the site. */
  @UseGuards(AdminGuard)
  @Mutation(() => Boolean)
  grantPromotion(
    @CurrentUser() user: AuthUser,
    @Args('targetType', { type: () => PromotionTarget }) targetType: PromotionTarget,
    @Args('targetId') targetId: string,
    @Args('tier', { type: () => PromotionTier }) tier: PromotionTier,
    @Args('days', { type: () => Int }) days: number,
  ) {
    return this.promotions.grant(user.id, { targetType, targetId }, tier, days);
  }

  @UseGuards(AdminGuard)
  @Mutation(() => Boolean)
  revokePromotion(@Args('id') id: string) {
    return this.promotions.revoke(id);
  }
}
