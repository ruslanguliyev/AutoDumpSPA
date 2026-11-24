/** Tokens one model call used, as reported by the API. */
export type AiUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
};

/** USD per million tokens, Anthropic list prices. Cache writes are 1.25x input (5-minute TTL). */
type Price = { input: number; output: number; cacheRead: number };

const PRICES: Array<[RegExp, Price]> = [
  [/^claude-haiku-5-5/, { input: 0.1, output: 0.5, cacheRead: 0.01 }],
  [/^claude-haiku-4-5/, { input: 1, output: 5, cacheRead: 0.1 }],
  [/^claude-sonnet-5-5/, { input: 2, output: 10, cacheRead: 0.1 }],
  [/^claude-sonnet-5/, { input: 2, output: 10, cacheRead: 0.2 }],
  [/^claude-sonnet-4/, { input: 3, output: 15, cacheRead: 0.3 }],
  [/^claude-opus-5-5/, { input: 4, output: 20, cacheRead: 0.2 }],
  [/^claude-opus/, { input: 5, output: 25, cacheRead: 0.5 }],
  [/^claude-(fable|mythos)-5-2/, { input: 8, output: 40, cacheRead: 0.2 }],
  [/^claude-(fable|mythos)/, { input: 10, output: 50, cacheRead: 0.25 }],
];

/** Unknown models are priced like the most expensive tier, so the cap errs on the safe side. */
const FALLBACK_PRICE: Price = { input: 10, output: 50, cacheRead: 1 };

export function priceOf(model: string): Price {
  return PRICES.find(([pattern]) => pattern.test(model))?.[1] ?? FALLBACK_PRICE;
}

/** Estimated cost of one call in millionths of a dollar (1 token at $1/MTok = 1 micro-dollar). */
export function costMicroUsd(usage: AiUsage): number {
  const price = priceOf(usage.model);
  return Math.ceil(
    usage.inputTokens * price.input +
      usage.cacheWriteTokens * price.input * 1.25 +
      usage.cacheReadTokens * price.cacheRead +
      usage.outputTokens * price.output,
  );
}

type ApiUsage = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};

export function usageFrom(model: string, usage: ApiUsage | null | undefined): AiUsage {
  return {
    model,
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
    cacheReadTokens: usage?.cache_read_input_tokens ?? 0,
    cacheWriteTokens: usage?.cache_creation_input_tokens ?? 0,
  };
}
