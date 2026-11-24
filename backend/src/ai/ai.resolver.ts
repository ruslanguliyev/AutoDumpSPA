import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { AiBudget } from './ai-budget.service';
import { AiService } from './ai.service';
import { AiChatService } from './chat/chat.service';
import { SearchMissLog } from './chat/search-miss.service';
import { AiChatInput, AiChatReply } from './chat/chat.types';
import {
  AiLanguage,
  AiSearchMissSummary,
  AiStatus,
  AiUsageDayReport,
  GenerateListingDescriptionInput,
  GenerateListingDescriptionResult,
  ParsedVehicleSearch,
} from './ai.types';

type AiContext = { req: { ip?: string; user?: { id: string } } };

@Resolver()
export class AiResolver {
  constructor(
    private readonly ai: AiService,
    private readonly chat: AiChatService,
    private readonly budget: AiBudget,
    private readonly misses: SearchMissLog,
  ) {}

  @Query(() => AiStatus)
  async aiStatus(): Promise<AiStatus> {
    return { enabled: this.ai.isEnabled(), paused: await this.ai.isPaused() };
  }

  /** What visitors asked the assistant for and the catalogue did not have. */
  @Query(() => [AiSearchMissSummary])
  @UseGuards(AdminGuard)
  aiSearchMisses(
    @Args('days', { type: () => Int, defaultValue: 7 }) days: number,
  ): Promise<AiSearchMissSummary[]> {
    return this.misses.summary(days);
  }

  /** Daily AI spend: requests, tokens and the estimated cost in USD. */
  @Query(() => [AiUsageDayReport])
  @UseGuards(AdminGuard)
  aiUsage(@Args('days', { type: () => Int, defaultValue: 14 }) days: number): Promise<AiUsageDayReport[]> {
    return this.budget.report(days);
  }

  @Mutation(() => GenerateListingDescriptionResult)
  @UseGuards(GqlAuthGuard)
  generateListingDescription(
    @Args('input') input: GenerateListingDescriptionInput,
    @CurrentUser() user: { id: string },
  ): Promise<GenerateListingDescriptionResult> {
    return this.ai.generateDescription(user.id, input);
  }

  @Mutation(() => ParsedVehicleSearch)
  parseVehicleSearchQuery(
    @Args('query') query: string,
    @Args('language', { type: () => AiLanguage }) language: AiLanguage,
    @Context() context: AiContext,
  ): Promise<ParsedVehicleSearch> {
    return this.ai.parseSearch(query, language, context.req?.ip ?? 'unknown');
  }

  /** The site assistant: answers from our own catalogue only. Open to guests, limited per IP. */
  @Mutation(() => AiChatReply)
  aiChat(
    @Args('input') input: AiChatInput,
    @Context() context: AiContext,
  ): Promise<AiChatReply> {
    return this.chat.reply(input.messages, input.language, context.req?.ip ?? 'unknown') as Promise<AiChatReply>;
  }
}
