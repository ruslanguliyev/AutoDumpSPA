import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

import { readAiConfig } from '../ai.config';
import { AiChatProvider, AiChatRequest, AiChatResponse } from './ai-chat-provider';

/** Models that accept the server-side refusal fallback (re-runs a declined turn on a sibling model). */
const FALLBACK_MODELS = /^claude-(opus-5-5|sonnet-5-5|fable-5-[12]|opus-5)$/;
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

const textOf = (content: Anthropic.ContentBlock[]) =>
  content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

/**
 * Manual tool loop over the Messages API: the model calls our catalogue tools,
 * we run them and hand back the rows, until it answers in text.
 */
@Injectable()
export class AnthropicChatProvider implements AiChatProvider {
  constructor(private readonly config: ConfigService) {}

  async chat(request: AiChatRequest): Promise<AiChatResponse> {
    const { apiKey } = readAiConfig(this.config);
    if (!apiKey) throw new Error('AI provider is not configured');

    const client = new Anthropic({ apiKey, timeout: request.timeoutMs, maxRetries: 1 });
    const tools: Anthropic.Tool[] = request.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.schema as Anthropic.Tool.InputSchema,
    }));
    const messages: Anthropic.MessageParam[] = request.history.map((turn) => ({
      role: turn.role,
      content: turn.text,
    }));
    const withFallback = FALLBACK_MODELS.test(request.model);
    const deadline = Date.now() + request.timeoutMs;

    for (let round = 0; round <= request.maxRounds; round += 1) {
      const lastRound = round === request.maxRounds;
      const remaining = Math.max(1_000, deadline - Date.now());
      // Fields newer than the installed SDK's types (effort, fallbacks) go through as plain body keys.
      const body = {
        model: request.model,
        max_tokens: request.maxTokens,
        system: request.system,
        tools,
        tool_choice: lastRound ? { type: 'none' as const } : { type: 'auto' as const },
        messages,
        output_config: { effort: request.effort },
        ...(withFallback ? { fallbacks: 'default' } : {}),
      } as unknown as Anthropic.MessageCreateParamsNonStreaming;

      const response = await client.messages.create(body, {
        signal: AbortSignal.timeout(remaining),
        ...(withFallback ? { headers: { 'anthropic-beta': FALLBACK_BETA } } : {}),
      });

      if (response.stop_reason === 'refusal') return { text: '', refused: true };

      const toolUses = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      );
      if (response.stop_reason !== 'tool_use' || toolUses.length === 0 || lastRound) {
        return { text: textOf(response.content), refused: false };
      }

      // Keep the assistant turn exactly as returned (thinking blocks included).
      messages.push({ role: 'assistant', content: response.content });
      const results: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUses.map(async (use) => {
          try {
            const output = await request.runTool(use.name, use.input);
            return {
              type: 'tool_result' as const,
              tool_use_id: use.id,
              content: JSON.stringify(output),
            };
          } catch {
            return {
              type: 'tool_result' as const,
              tool_use_id: use.id,
              content: 'Search failed. Tell the user the search is temporarily unavailable.',
              is_error: true,
            };
          }
        }),
      );
      // All results of one round go back in a single user message.
      messages.push({ role: 'user', content: results });
    }

    return { text: '', refused: false };
  }
}
