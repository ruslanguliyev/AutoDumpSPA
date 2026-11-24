import type { AiUsage } from '../ai-usage';
import type { AiTool } from './ai-provider';

export const AI_CHAT_PROVIDER = Symbol('AI_CHAT_PROVIDER');

export type AiChatImage = { mediaType: 'image/jpeg' | 'image/png' | 'image/webp'; data: string };

/** A photo rides only on the user turn it was sent with. */
export type AiChatTurn = { role: 'user' | 'assistant'; text: string; image?: AiChatImage };

/** Runs one tool the model asked for and returns what the model should read back. */
export type AiToolRunner = (name: string, input: unknown) => Promise<unknown>;

export type AiChatRequest = {
  model: string;
  effort: 'low' | 'medium' | 'high';
  /** Byte-stable instructions; cached together with the tools. */
  system: string;
  /** Per-request instructions (language) that go after the cached part. */
  systemSuffix?: string;
  history: AiChatTurn[];
  tools: AiTool[];
  /** Tool rounds before the model must answer with what it has. */
  maxRounds: number;
  maxTokens: number;
  timeoutMs: number;
  runTool: AiToolRunner;
  /** Called with each piece of answer text as the model writes it. */
  onText?: (delta: string) => void;
  /** Called when the model starts a round of catalogue searches. */
  onSearch?: () => void;
  /** Aborts the whole exchange, e.g. when the visitor closes the chat. */
  signal?: AbortSignal;
};

/** `usage` has one entry per model call, so the cost of every round is counted. */
export type AiChatResponse = { text: string; refused: boolean; usage?: AiUsage[] };

export interface AiChatProvider {
  chat(request: AiChatRequest): Promise<AiChatResponse>;
}

/** Tokens already spent when a chat call fails part-way (an error thrown by chat() may carry them). */
export function usageOfError(error: unknown): AiUsage[] {
  const usage = (error as { usage?: unknown } | null)?.usage;
  return Array.isArray(usage) ? (usage as AiUsage[]) : [];
}
