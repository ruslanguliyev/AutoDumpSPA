import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ReportStatus } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { ModerationService } from './moderation.service';
import { ReviewTargetType } from '../reviews/review.types';
import { AdminProfileObject, ReportListingInput, ReportObject } from './moderation.types';

@Resolver()
export class ModerationResolver {
  constructor(private readonly moderationService: ModerationService) {}

  /** Any signed-in user can report a published listing. */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  reportListing(@CurrentUser() user: AuthUser, @Args('input') input: ReportListingInput) {
    return this.moderationService.reportListing(user.id, input);
  }

  @UseGuards(AdminGuard)
  @Query(() => [ReportObject])
  reports(
    @Args('status', { type: () => ReportStatus, nullable: true, defaultValue: ReportStatus.OPEN })
    status: ReportStatus,
  ) {
    return this.moderationService.listReports(status);
  }

  @UseGuards(AdminGuard)
  @Mutation(() => Boolean)
  dismissReport(@Args('id') id: string) {
    return this.moderationService.dismissReport(id);
  }

  @UseGuards(AdminGuard)
  @Mutation(() => Boolean)
  blockListing(@Args('listingId') listingId: string, @Args('reason') reason: string) {
    return this.moderationService.blockListing(listingId, reason);
  }

  @UseGuards(AdminGuard)
  @Mutation(() => Boolean)
  unblockListing(@Args('listingId') listingId: string) {
    return this.moderationService.unblockListing(listingId);
  }

  @UseGuards(AdminGuard)
  @Query(() => [AdminProfileObject])
  adminProfiles(
    @Args('targetType', { type: () => ReviewTargetType }) targetType: ReviewTargetType,
    @Args('search', { type: () => String, nullable: true }) search?: string | null,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number | null,
  ) {
    return this.moderationService.listProfiles(targetType, search, limit ?? undefined);
  }

  @UseGuards(AdminGuard)
  @Mutation(() => Boolean)
  setProfileVerified(
    @Args('targetType', { type: () => ReviewTargetType }) targetType: ReviewTargetType,
    @Args('targetId') targetId: string,
    @Args('verified') verified: boolean,
  ) {
    return this.moderationService.setVerified(targetType, targetId, verified);
  }
}
