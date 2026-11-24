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
