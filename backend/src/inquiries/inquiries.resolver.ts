import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InquiryStatus } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryInput, InquiryObject } from './inquiry.types';

@Resolver(() => InquiryObject)
@UseGuards(GqlAuthGuard)
export class InquiriesResolver {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Mutation(() => InquiryObject)
  createInquiry(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreateInquiryInput,
  ) {
    return this.inquiriesService.create(user.id, input);
  }

  @Query(() => [InquiryObject])
  receivedInquiries(
    @CurrentUser() user: AuthUser,
    @Args('status', { type: () => InquiryStatus, nullable: true }) status?: InquiryStatus,
  ) {
    return this.inquiriesService.received(user.id, status);
  }

  @Query(() => [InquiryObject])
  sentInquiries(@CurrentUser() user: AuthUser) {
    return this.inquiriesService.sent(user.id);
  }

  @Query(() => Int)
  unreadInquiriesCount(@CurrentUser() user: AuthUser) {
    return this.inquiriesService.unreadCount(user.id);
  }

  @Mutation(() => InquiryObject)
  markInquiryRead(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.inquiriesService.markRead(user.id, id);
  }
}
