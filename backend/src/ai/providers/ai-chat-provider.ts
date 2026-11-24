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
  system: string;
  history: AiChatTurn[];
  tools: AiTool[];
  /** Tool rounds before the model must answer with what it has. */
  maxRounds: number;
  maxTokens: number;
  timeoutMs: number;
  runTool: AiToolRunner;
};

export type AiChatResponse = { text: string; refused: boolean };

export interface AiChatProvider {
  chat(request: AiChatRequest): Promise<AiChatResponse>;
}
