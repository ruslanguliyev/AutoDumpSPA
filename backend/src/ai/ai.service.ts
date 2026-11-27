import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiBudget } from './ai-budget.service';
import { aiError } from './ai.errors';
import { readAiConfig } from './ai.config';
import { normalizeSearch, RawSearchParse } from './catalog/normalize-search';
import {
  AiLanguageCode,
  buildDescriptionResult,
  DescriptionFacts,
  DescriptionValidationError,
} from './description/description-result';
import {
  DESCRIPTION_TOOL,
  descriptionSystemPrompt,
  descriptionUserPrompt,
  DescriptionModeCode,
  DescriptionToneCode,
} from './description/description-prompt';
import { DESCRIPTION_MAX_LENGTH } from '../listings/description-limit';
import { AI_PROVIDER, AiProvider } from './providers/ai-provider';
import { AiRateLimiter } from './rate-limit';
import { SEARCH_TOOL, searchSystemPrompt, searchUserPrompt } from './search/search-prompt';
import { SearchParseCache } from './search-cache';
import type { ChatImage } from './chat/chat-image';
import { PART_PHOTO_TOOL, partPhotoSystemPrompt, partPhotoUserPrompt } from './part-photo/part-photo-prompt';
import { buildPartPhotoResult, PartPhotoResult } from './part-photo/part-photo-result';
import { TRANSLATE_TOOL, translateSystemPrompt, translateUserPrompt } from './translate/translate-prompt';
import { buildTranslateResult, TranslateResult } from './translate/translate-result';
import type { PartText } from '../translations/part-translations';
import type { TextFields } from '../translations/text-translations';
import {
  buildFieldsTranslateResult,
  FieldsTranslateResult,
  translateFieldsTool,
  translateFieldsUserPrompt,
} from './translate/translate-fields';

export type GenerateDescriptionCommand = {
  brand: string;
  model: string;
  generation?: string | null;
  trim?: string | null;
  year: number;
  mileage?: number | null;
  engineVolume?: number | null;
  horsepower?: number | null;
  transmission?: string | null;
  fuel?: string | null;
  bodyType?: string | null;
  condition?: string | null;
  city?: string | null;
  currentText?: string | null;
  tone: DescriptionToneCode;
  language: AiLanguageCode;
  mode: DescriptionModeCode;
};

const optionalText = (value: string | null | undefined) => {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
};

@Injectable()
export class AiService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(AI_PROVIDER) private readonly provider: AiProvider,
    private readonly limiter: AiRateLimiter,
    private readonly cache: SearchParseCache,
    private readonly budget: AiBudget,
  ) {}

  isEnabled(): boolean {
    return readAiConfig(this.configService).enabled;
  }

  /** True while the site-wide daily AI cap is reached; every AI feature is paused until tomorrow. */
  async isPaused(): Promise<boolean> {
    const config = readAiConfig(this.configService);
    return config.enabled && (await this.budget.isPaused(config));
  }

  async generateDescription(userId: string, command: GenerateDescriptionCommand) {
    const config = readAiConfig(this.configService);
    if (!config.enabled) throw aiError('UNAVAILABLE');

    const facts = this.facts(command);
    const currentText = optionalText(command.currentText);
    if (currentText && currentText.length > DESCRIPTION_MAX_LENGTH) throw aiError('INVALID_INPUT');
    if (
      (command.mode === 'SHORTER' || command.mode === 'LONGER' || command.mode === 'REGENERATE') &&
      !currentText
    ) {
      throw aiError('INVALID_INPUT');
    }
    if (!this.limiter.take(`description:${userId}`, config.descriptionLimit, config.descriptionWindowMs)) {
      throw aiError('RATE_LIMITED');
    }
    await this.budget.reserve(config, `user:${userId}`, 1);

    let raw: unknown;
    try {
      raw = await this.provider.complete({
        onUsage: (usage) => this.budget.record('description', [usage]),
        model: config.descriptionModel,
        system: descriptionSystemPrompt(),
        user: descriptionUserPrompt({
          facts,
          currentText,
          tone: command.tone,
          language: command.language,
          mode: command.mode,
        }),
        tool: DESCRIPTION_TOOL,
        temperature: command.mode === 'REGENERATE' ? 0.3 : 0.2,
        maxTokens: 1200,
        timeoutMs: config.timeoutMs,
      });
    } catch {
      throw aiError('UNAVAILABLE');
    }

    const payload = raw as { text?: unknown; usedKeys?: unknown };
    try {
      return buildDescriptionResult({
        text: payload?.text,
        usedKeys: payload?.usedKeys,
        facts,
        language: command.language,
      });
    } catch (error) {
      if (error instanceof DescriptionValidationError) throw aiError('INVALID_RESULT');
      throw aiError('INVALID_RESULT');
    }
  }

  async parseSearch(query: string, language: AiLanguageCode, ip: string) {
    const config = readAiConfig(this.configService);
    if (!config.enabled) throw aiError('UNAVAILABLE');
    const text = query.trim();
    if (!text || text.length > 300) throw aiError('INVALID_INPUT');

    const cacheKey = SearchParseCache.key(text, language);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    if (!this.limiter.take(`search:${ip || 'unknown'}`, config.searchLimit, config.searchWindowMs)) {
      throw aiError('RATE_LIMITED');
    }
    await this.budget.reserve(config, ip || 'unknown', 1);

    let raw: unknown;
    try {
      raw = await this.provider.complete({
        onUsage: (usage) => this.budget.record('search', [usage]),
        model: config.searchModel,
        system: searchSystemPrompt(),
        user: searchUserPrompt(text, language),
        tool: SEARCH_TOOL,
        temperature: 0,
        maxTokens: 800,
        timeoutMs: config.timeoutMs,
      });
    } catch {
      throw aiError('UNAVAILABLE');
    }

    if (!raw || typeof raw !== 'object') throw aiError('INVALID_RESULT');
    const normalized = normalizeSearch(raw as RawSearchParse);
    this.cache.set(cacheKey, normalized, config.searchCacheTtlMs);
    return normalized;
  }

  /**
   * Looks at a photo of a car part and suggests the listing fields: name, category from our list,
   * brand and part number when printed, compatibility matched to our own make/model catalogue,
   * and a short description. Condition and price are never suggested; the seller sets them.
   */
  async recognizePart(userId: string, image: ChatImage, language: AiLanguageCode): Promise<PartPhotoResult> {
    const config = readAiConfig(this.configService);
    if (!config.enabled) throw aiError('UNAVAILABLE');
    if (!this.limiter.take(`part-photo:${userId}`,config.chatImageLimit, config.chatImageWindowMs)) {
      throw aiError('RATE_LIMITED');
    }
    await this.budget.reserve(config, `user:${userId}`, config.chatImageWeight);

    let raw: unknown;
    try {
      raw = await this.provider.complete({
        onUsage: (usage) => this.budget.record('part-photo', [usage]),
        model: config.chatVisionModel,
        system: partPhotoSystemPrompt(),
        user: partPhotoUserPrompt(language),
        image: { mediaType: image.mediaType, data: image.data },
        tool: PART_PHOTO_TOOL,
        temperature: 0,
        maxTokens: 1200,
        timeoutMs: config.chatTimeoutMs,
      });
    } catch {
      throw aiError('UNAVAILABLE');
    }

    try {
      return buildPartPhotoResult(raw);
    } catch {
      throw aiError('INVALID_RESULT');
    }
  }

  /**
   * The listing's name and description in Azerbaijani, Russian and English, plus the language
   * the seller wrote in. Billed to the seller's daily allowance like their other AI calls.
   */
  async translateListing(sellerId: string, text: PartText): Promise<TranslateResult> {
    const config = readAiConfig(this.configService);
    if (!config.enabled) throw aiError('UNAVAILABLE');
    if (!text.name.trim()) throw aiError('INVALID_INPUT');
    await this.budget.reserve(config, `seller:${sellerId}`, 1);

    let raw: unknown;
    try {
      raw = await this.provider.complete({
        onUsage: (usage) => this.budget.record('translate', [usage]),
        model: config.translateModel,
        system: translateSystemPrompt(),
        user: translateUserPrompt(text),
        tool: TRANSLATE_TOOL,
        temperature: 0,
        maxTokens: 4000,
        timeoutMs: config.chatTimeoutMs,
      });
    } catch {
      throw aiError('UNAVAILABLE');
    }

    try {
      return buildTranslateResult(raw, text);
    } catch {
      throw aiError('INVALID_RESULT');
    }
  }

  /**
   * Any set of seller-written fields (a car description, a service center's description and
   * price list, a master's bio) in Azerbaijani, Russian and English. `caller` is whose daily
   * AI allowance pays for it ("seller:<id>" or "user:<id>"); `context` says what the text is.
   */
  async translateFields(caller: string, fields: TextFields, context: string): Promise<FieldsTranslateResult> {
    const config = readAiConfig(this.configService);
    if (!config.enabled) throw aiError('UNAVAILABLE');
    if (!Object.keys(fields).length) throw aiError('INVALID_INPUT');
    await this.budget.reserve(config, caller, 1);

    const size = Object.values(fields).reduce((total, text) => total + text.length, 0);
    let raw: unknown;
    try {
      raw = await this.provider.complete({
        onUsage: (usage) => this.budget.record('translate', [usage]),
        model: config.translateModel,
        system: translateSystemPrompt(),
        user: translateFieldsUserPrompt(fields, context),
        tool: translateFieldsTool(fields),
        temperature: 0,
        // Two translated copies of the text, with room for Azerbaijani and Russian running longer.
        maxTokens: Math.min(16_000, Math.max(2000, Math.ceil(size * 1.5))),
        timeoutMs: config.chatTimeoutMs,
      });
    } catch {
      throw aiError('UNAVAILABLE');
    }

    try {
      return buildFieldsTranslateResult(raw, fields);
    } catch {
      throw aiError('INVALID_RESULT');
    }
  }

  private facts(command: GenerateDescriptionCommand): DescriptionFacts {
    const brand = command.brand?.trim() ?? '';
    const model = command.model?.trim() ?? '';
    const year = command.year;
    if (!brand || !model || !Number.isInteger(year) || year < 1950 || year > 2035) {
      throw aiError('INVALID_INPUT');
    }
    const mileage = command.mileage;
    if (mileage != null && (!Number.isInteger(mileage) || mileage < 0 || mileage > 2_000_000)) {
      throw aiError('INVALID_INPUT');
    }
    const engineVolume = command.engineVolume;
    if (engineVolume != null && (!Number.isFinite(engineVolume) || engineVolume <= 0 || engineVolume > 20)) {
      throw aiError('INVALID_INPUT');
    }
    const horsepower = command.horsepower;
    if (horsepower != null && (!Number.isInteger(horsepower) || horsepower <= 0 || horsepower > 3000)) {
      throw aiError('INVALID_INPUT');
    }
    return {
      brand,
      model,
      generation: optionalText(command.generation),
      trim: optionalText(command.trim),
      year,
      mileage: mileage ?? null,
      engineVolume: engineVolume ?? null,
      horsepower: horsepower ?? null,
      transmission: optionalText(command.transmission),
      fuel: optionalText(command.fuel),
      bodyType: optionalText(command.bodyType),
      condition: optionalText(command.condition),
      city: optionalText(command.city),
    };
  }
}
