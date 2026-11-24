import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import type { Request } from 'express';
import { AuthUser } from '../../auth/auth.types';
import { CurrentUser } from '../decorators/current-user.decorator';
import { OptionalGqlAuthGuard } from '../guards/optional-gql-auth.guard';
import { ViewTarget } from './views.types';
import { ViewsService } from './views.service';

interface GqlContext {
  req?: Request;
}

@Resolver()
export class ViewsResolver {
  constructor(private readonly views: ViewsService) {}

  /** Counts an opened detail page. Owners, bots and repeat visits inside 30 minutes do not count. */
  @UseGuards(OptionalGqlAuthGuard)
  @Mutation(() => Boolean)
  trackView(
    @Args('targetType', { type: () => ViewTarget }) targetType: ViewTarget,
    @Args('targetId') targetId: string,
    @CurrentUser() user: AuthUser | null,
    @Context() context: GqlContext,
  ) {
    return this.views.recordView({
      targetType,
      targetId,
      viewerUserId: user?.id,
      req: context?.req,
    });
  }
}
