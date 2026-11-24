import type { AiUsage } from '../ai-usage';

export const AI_PROVIDER = Symbol('AI_PROVIDER');

export type AiTool = {
  name: string;
  description: string;
  schema: Record<string, unknown>;
};

export type AiCompletionRequest = {
  model: string;
  system: string;
  user: string;
  tool: AiTool;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  /** Receives the tokens the call used, for the daily budget and the cost log. */
  onUsage?: (usage: AiUsage) => void;
};

export interface AiProvider {
  complete(request: AiCompletionRequest): Promise<unknown>;
}
