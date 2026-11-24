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
};

export interface AiProvider {
  complete(request: AiCompletionRequest): Promise<unknown>;
}
