import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { aiError } from '../ai.errors';
import { readAiConfig } from '../ai.config';
import type { AiLanguageCode } from '../description/description-result';
import { AI_CHAT_PROVIDER, AiChatProvider, AiChatTurn } from '../providers/ai-chat-provider';
import { AiRateLimiter } from '../rate-limit';
import { CatalogCard, CatalogSearchResult, CatalogSearchService } from './catalog-search.service';
import {
  CATALOG_TOOLS,
  readCarInput,
  readKeywordInput,
  readPartInput,
  readRentalInput,
  readSellerInput,
  readSpecialistInput,
} from './catalog-tools';
import { chatSystemPrompt, languageNote } from './chat-prompt';

export const CHAT_MAX_MESSAGES = 16;
export const CHAT_MAX_MESSAGE_LENGTH = 1000;
/** Cards returned with one reply; the rest stays reachable through the catalogue pages. */
export const CHAT_MAX_CARDS = 12;

export type ChatMessage = { role: 'USER' | 'ASSISTANT'; text: string };
export type ChatReply = { text: string; cards: CatalogCard[] };

/** What the model reads back from a search: rows without image URLs, plus the total. */
const forModel = (result: CatalogSearchResult) => ({
  total: result.total,
  shown: result.items.length,
  items: result.items.map(({ imageUrl: _image, path: _path, ...rest }) => rest),
});

/**
 * Keeps the last messages, trims each one and makes sure the history starts with the user,
 * as the Messages API requires. Returns null when there is nothing to answer.
 */
export function normalizeHistory(messages: ChatMessage[]): AiChatTurn[] | null {
  const turns = messages
    .map((message) => ({
      role: message.role === 'ASSISTANT' ? ('assistant' as const) : ('user' as const),
      text: (message.text ?? '').trim(),
    }))
    .filter((turn) => turn.text.length > 0);
  const last = turns[turns.length - 1];
  if (!last || last.role !== 'user' || last.text.length > CHAT_MAX_MESSAGE_LENGTH) return null;

  const recent = turns
    .slice(-CHAT_MAX_MESSAGES)
    .map((turn) => ({ ...turn, text: turn.text.slice(0, CHAT_MAX_MESSAGE_LENGTH) }));
  while (recent.length && recent[0].role !== 'user') recent.shift();
  return recent.length ? recent : null;
}

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(AI_CHAT_PROVIDER) private readonly provider: AiChatProvider,
    private readonly limiter: AiRateLimiter,
    private readonly catalog: CatalogSearchService,
  ) {}

  async reply(messages: ChatMessage[], language: AiLanguageCode, ip: string): Promise<ChatReply> {
    const config = readAiConfig(this.configService);
    if (!config.enabled) throw aiError('UNAVAILABLE');
    const history = normalizeHistory(messages ?? []);
    if (!history) throw aiError('INVALID_INPUT');
    if (!this.limiter.take(`chat:${ip || 'unknown'}`, config.chatLimit, config.chatWindowMs)) {
      throw aiError('RATE_LIMITED');
    }

    const cards = new Map<string, CatalogCard>();
    const runTool = async (name: string, input: unknown) => {
      const result = await this.search(name, input);
      for (const card of result.items) {
        const key = `${card.kind}:${card.id}`;
        if (!cards.has(key) && cards.size < CHAT_MAX_CARDS) cards.set(key, card);
      }
      return forModel(result);
    };

    let response;
    try {
      response = await this.provider.chat({
        model: config.chatModel,
        effort: config.chatEffort,
        system: `${chatSystemPrompt()}\n\nLanguage rule: ${languageNote(language)}`,
        history,
        tools: CATALOG_TOOLS,
        maxRounds: 4,
        maxTokens: 4000,
        timeoutMs: config.chatTimeoutMs,
        runTool,
      });
    } catch (error) {
      this.logger.warn(`Chat request failed: ${error instanceof Error ? error.message : String(error)}`);
      throw aiError('UNAVAILABLE');
    }

    if (response.refused || !response.text) throw aiError('INVALID_RESULT');
    return { text: response.text, cards: [...cards.values()] };
  }

  private search(name: string, input: unknown): Promise<CatalogSearchResult> {
    switch (name) {
      case 'search_cars':
        return this.catalog.searchCars(readCarInput(input));
      case 'search_rentals':
        return this.catalog.searchRentals(readRentalInput(input));
      case 'search_parts':
        return this.catalog.searchParts(readPartInput(input));
      case 'search_car_services':
        return this.catalog.searchServiceCenters(readKeywordInput(input));
      case 'search_specialists':
        return this.catalog.searchSpecialists(readSpecialistInput(input));
      case 'search_sellers':
        return this.catalog.searchSellers(readSellerInput(input));
      default:
        return Promise.reject(new Error(`Unknown tool ${name}`));
    }
  }
}
