import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiBudget } from '../ai-budget.service';
import { aiError } from '../ai.errors';
import { readAiConfig } from '../ai.config';
import type { AiLanguageCode } from '../description/description-result';
import {
  AI_CHAT_PROVIDER,
  AiChatProvider,
  AiChatResponse,
  AiChatTurn,
  usageOfError,
} from '../providers/ai-chat-provider';
import { stableKey, TtlCache } from '../ttl-cache';
import type { ChatImage } from './chat-image';
import { AiRateLimiter } from '../rate-limit';
import { CatalogCard, CatalogSearchResult, CatalogSearchService } from './catalog-search.service';
import {
  CarSearchInput,
  CATALOG_TOOLS,
  KeywordSearchInput,
  PartSearchInput,
  RentalSearchInput,
  SellerSearchInput,
  SpecialistSearchInput,
  readCarInput,
  readKeywordInput,
  readPartInput,
  readRentalInput,
  readSellerInput,
  readSpecialistInput,
} from './catalog-tools';
import { chatSystemPrompt, languageNote } from './chat-prompt';
import { relaxations } from './near-matches';
import { SearchMissLog } from './search-miss.service';

export const CHAT_MAX_MESSAGES = 16;
export const CHAT_MAX_MESSAGE_LENGTH = 1000;
/** Cards returned with one reply; the rest stays reachable through the catalogue pages. */
export const CHAT_MAX_CARDS = 12;

export type ChatMessage = { role: 'USER' | 'ASSISTANT'; text: string };
export type ChatReply = { text: string; cards: CatalogCard[] };

/** Live hooks for a streamed reply. */
export type ChatStreamHooks = {
  onText?: (delta: string) => void;
  onSearch?: () => void;
  signal?: AbortSignal;
};

/** Softer searches tried after an empty one, at most. */
const MAX_RELAXATIONS = 4;

/** The cache key of a first question: language, model and the folded text. */
const questionKey = (language: string, model: string, text: string) =>
  `${language}|${model}|${text.trim().toLowerCase().replace(/\s+/g, ' ')}`;

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
/** Stands in for the user's words when they send a photo without writing anything. */
export const PHOTO_ONLY_TEXT = '[The user sent a photo without a message.]';

export function normalizeHistory(messages: ChatMessage[], withPhoto = false): AiChatTurn[] | null {
  const turns = messages
    .map((message) => ({
      role: message.role === 'ASSISTANT' ? ('assistant' as const) : ('user' as const),
      text: (message.text ?? '').trim(),
    }))
    .filter((turn, index, all) => turn.text.length > 0 || (withPhoto && index === all.length - 1));
  const last = turns[turns.length - 1];
  if (withPhoto && last?.role === 'user' && !last.text) last.text = PHOTO_ONLY_TEXT;
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
  /** Answers to identical first questions (the example chips, common asks). */
  private readonly replies = new TtlCache<ChatReply>(300);
  /** Rows of identical catalogue searches. */
  private readonly searches = new TtlCache<CatalogSearchResult>(500);

  constructor(
    private readonly configService: ConfigService,
    @Inject(AI_CHAT_PROVIDER) private readonly provider: AiChatProvider,
    private readonly limiter: AiRateLimiter,
    private readonly catalog: CatalogSearchService,
    private readonly budget: AiBudget,
    private readonly misses: SearchMissLog,
  ) {}

  async reply(
    messages: ChatMessage[],
    language: AiLanguageCode,
    ip: string,
    image?: ChatImage | null,
    hooks: ChatStreamHooks = {},
  ): Promise<ChatReply> {
    const config = readAiConfig(this.configService);
    if (!config.enabled) throw aiError('UNAVAILABLE');
    const history = normalizeHistory(messages ?? [], Boolean(image));
    if (!history) throw aiError('INVALID_INPUT');
    const caller = ip || 'unknown';
    if (image && !this.limiter.take(`chat-image:${caller}`, config.chatImageLimit, config.chatImageWindowMs)) {
      throw aiError('RATE_LIMITED');
    }
    if (!this.limiter.take(`chat:${caller}`, config.chatLimit, config.chatWindowMs)) {
      throw aiError('RATE_LIMITED');
    }

    // Photos go to the stronger vision model; text questions run on the cheap one.
    const model = image ? config.chatVisionModel : config.chatModel;
    const cacheKey = !image && history.length === 1 ? questionKey(language, model, history[0].text) : null;
    const cached = cacheKey ? this.replies.get(cacheKey) : null;
    if (cached) {
      hooks.onText?.(cached.text);
      return cached;
    }

    await this.budget.reserve(config, caller, image ? config.chatImageWeight : 1);
    if (image) {
      // The photo belongs to the message it was sent with: the last one.
      history[history.length - 1].image = { mediaType: image.mediaType, data: image.data };
    }

    const cards = new Map<string, CatalogCard>();
    const keep = (result: CatalogSearchResult) => {
      for (const card of result.items) {
        const key = `${card.kind}:${card.id}`;
        if (!cards.has(key) && cards.size < CHAT_MAX_CARDS) cards.set(key, card);
      }
    };
    const runTool = async (name: string, raw: unknown) => {
      const input = parseToolInput(name, raw);
      const result = await this.search(name, input, config.catalogCacheTtlMs);
      if (result.total > 0) {
        keep(result);
        return forModel(result);
      }
      this.misses.record(name, input, language);
      // Nothing exact: try one softer search at a time (nearby city, wider years, …).
      for (const step of relaxations(name, input).slice(0, MAX_RELAXATIONS)) {
        const near = await this.search(name, step.input, config.catalogCacheTtlMs);
        if (near.total > 0) {
          keep(near);
          return { ...forModel(result), nearMatches: { changed: step.changed, ...forModel(near) } };
        }
      }
      return forModel(result);
    };

    const feature = image ? 'chat-photo' : 'chat';
    let response: AiChatResponse;
    try {
      response = await this.provider.chat({
        model,
        effort: config.chatEffort,
        system: chatSystemPrompt(),
        systemSuffix: `Language rule: ${languageNote(language)}`,
        history,
        tools: CATALOG_TOOLS,
        maxRounds: 4,
        maxTokens: 4000,
        timeoutMs: config.chatTimeoutMs,
        runTool,
        onText: hooks.onText,
        onSearch: hooks.onSearch,
        signal: hooks.signal,
      });
    } catch (error) {
      this.budget.record(feature, usageOfError(error));
      if (!hooks.signal?.aborted) {
        this.logger.warn(`Chat request failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      throw aiError('UNAVAILABLE');
    }
    this.budget.record(feature, response.usage ?? []);

    if (response.refused || !response.text) throw aiError('INVALID_RESULT');
    const reply = { text: response.text, cards: [...cards.values()] };
    if (cacheKey) this.replies.set(cacheKey, reply, config.chatCacheTtlMs);
    return reply;
  }

  private search(name: string, input: ToolInput, ttlMs: number): Promise<CatalogSearchResult> {
    const key = `${name}|${stableKey(input)}`;
    const cached = this.searches.get(key);
    if (cached) return Promise.resolve(cached);
    return this.runSearch(name, input).then((result) => {
      this.searches.set(key, result, ttlMs);
      return result;
    });
  }

  private runSearch(name: string, input: ToolInput): Promise<CatalogSearchResult> {
    switch (name) {
      case 'search_cars':
        return this.catalog.searchCars(input as CarSearchInput);
      case 'search_rentals':
        return this.catalog.searchRentals(input as RentalSearchInput);
      case 'search_parts':
        return this.catalog.searchParts(input as PartSearchInput);
      case 'search_car_services':
        return this.catalog.searchServiceCenters(input as KeywordSearchInput);
      case 'search_specialists':
        return this.catalog.searchSpecialists(input as SpecialistSearchInput);
      case 'search_sellers':
        return this.catalog.searchSellers(input as SellerSearchInput);
      default:
        return Promise.reject(new Error(`Unknown tool ${name}`));
    }
  }
}

type ToolInput =
  | CarSearchInput
  | RentalSearchInput
  | PartSearchInput
  | KeywordSearchInput
  | SpecialistSearchInput
  | SellerSearchInput;

/** Tool input comes from the model: keep only known fields with sane values. */
export function parseToolInput(name: string, raw: unknown): ToolInput {
  switch (name) {
    case 'search_cars':
      return readCarInput(raw);
    case 'search_rentals':
      return readRentalInput(raw);
    case 'search_parts':
      return readPartInput(raw);
    case 'search_car_services':
      return readKeywordInput(raw);
    case 'search_specialists':
      return readSpecialistInput(raw);
    case 'search_sellers':
      return readSellerInput(raw);
    default:
      throw new Error(`Unknown tool ${name}`);
  }
}
