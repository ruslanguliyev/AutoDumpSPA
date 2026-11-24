import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { AiService } from './ai.service';
import { AiChatService } from './chat/chat.service';
import { AiChatInput, AiChatReply } from './chat/chat.types';
import {
  AiLanguage,
  AiStatus,
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
  ) {}

  @Query(() => AiStatus)
  aiStatus(): AiStatus {
    return { enabled: this.ai.isEnabled() };
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
