import { ConfigService } from '@nestjs/config';

export type AiConfig = {
  enabled: boolean;
  apiKey: string;
  descriptionModel: string;
  searchModel: string;
  timeoutMs: number;
  descriptionLimit: number;
  descriptionWindowMs: number;
  searchLimit: number;
  searchWindowMs: number;
  searchCacheTtlMs: number;
  chatModel: string;
  chatEffort: 'low' | 'medium' | 'high';
  chatTimeoutMs: number;
  chatLimit: number;
  chatWindowMs: number;
};

const num = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const effort = (value: unknown): AiConfig['chatEffort'] => {
  const text = String(value ?? '').trim().toLowerCase();
  return text === 'medium' || text === 'high' ? text : 'low';
};

export function readAiConfig(config: ConfigService): AiConfig {
  const flag = String(config.get('AI_ENABLED') ?? '').trim().toLowerCase();
  const apiKey = String(config.get('ANTHROPIC_API_KEY') ?? '').trim();
  const enabled = (flag === 'true' || flag === '1') && apiKey.length > 0;
  return {
    enabled,
    apiKey,
    descriptionModel:
      String(config.get('AI_MODEL_DESCRIPTION') ?? '').trim() || 'claude-sonnet-5-5',
    searchModel: String(config.get('AI_MODEL_SEARCH') ?? '').trim() || 'claude-haiku-5-5',
    timeoutMs: num(config.get('AI_TIMEOUT_MS'), 20_000),
    descriptionLimit: num(config.get('AI_RATE_LIMIT_DESCRIPTION'), 20),
    descriptionWindowMs: num(config.get('AI_RATE_LIMIT_DESCRIPTION_WINDOW_SEC'), 3600) * 1000,
    searchLimit: num(config.get('AI_RATE_LIMIT_SEARCH'), 30),
    searchWindowMs: num(config.get('AI_RATE_LIMIT_SEARCH_WINDOW_SEC'), 3600) * 1000,
    searchCacheTtlMs: num(config.get('AI_SEARCH_CACHE_TTL_MS'), 60_000),
    chatModel: String(config.get('AI_MODEL_CHAT') ?? '').trim() || 'claude-opus-5-5',
    chatEffort: effort(config.get('AI_CHAT_EFFORT')),
    chatTimeoutMs: num(config.get('AI_CHAT_TIMEOUT_MS'), 45_000),
    chatLimit: num(config.get('AI_RATE_LIMIT_CHAT'), 40),
    chatWindowMs: num(config.get('AI_RATE_LIMIT_CHAT_WINDOW_SEC'), 3600) * 1000,
  };
}
