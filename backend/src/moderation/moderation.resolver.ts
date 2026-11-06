import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ReportStatus } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { ModerationService } from './moderation.service';
import { ReportListingInput, ReportObject } from './moderation.types';

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
}
