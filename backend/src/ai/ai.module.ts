import { Module } from '@nestjs/common';

import { AiBudget } from './ai-budget.service';
import { AiResolver } from './ai.resolver';
import { AiService } from './ai.service';
import { AiChatController } from './chat/chat.controller';
import { AiChatService } from './chat/chat.service';
import { CatalogSearchService } from './chat/catalog-search.service';
import { SearchMissLog } from './chat/search-miss.service';
import { AI_CHAT_PROVIDER } from './providers/ai-chat-provider';
import { AI_PROVIDER } from './providers/ai-provider';
import { AnthropicChatProvider } from './providers/anthropic-chat.provider';
import { AnthropicAiProvider } from './providers/anthropic.provider';
import { AiRateLimiter } from './rate-limit';
import { SearchParseCache } from './search-cache';

@Module({
  controllers: [AiChatController],
  providers: [
    AiResolver,
    AiService,
    AiRateLimiter,
    AiBudget,
    SearchMissLog,
    SearchParseCache,
    AnthropicAiProvider,
    { provide: AI_PROVIDER, useExisting: AnthropicAiProvider },
    AiChatService,
    CatalogSearchService,
    AnthropicChatProvider,
    { provide: AI_CHAT_PROVIDER, useExisting: AnthropicChatProvider },
  ],
  exports: [AiService],
})
export class AiModule {}
