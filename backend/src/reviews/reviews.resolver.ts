import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { OptionalGqlAuthGuard } from '../common/guards/optional-gql-auth.guard';
import { ReviewListObject, ReviewObject, ReviewTargetType, SubmitReviewInput } from './review.types';
import { ReviewsService } from './reviews.service';

@Resolver()
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** Public. When a valid token is sent, the viewer's own review is flagged with `mine`. */
  @UseGuards(OptionalGqlAuthGuard)
  @Query(() => ReviewListObject)
  reviews(
    @CurrentUser() user: AuthUser | undefined,
    @Args('targetType', { type: () => ReviewTargetType }) targetType: ReviewTargetType,
    @Args('targetId') targetId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ) {
    return this.reviewsService.list(targetType, targetId, user?.id, limit ?? undefined, offset ?? undefined);
  }

  /** Creates the review, or replaces the caller's earlier one for the same profile. */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => ReviewObject)
  submitReview(@CurrentUser() user: AuthUser, @Args('input') input: SubmitReviewInput) {
    return this.reviewsService.submit(user.id, input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  deleteReview(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.reviewsService.remove(user, id);
  }
}
