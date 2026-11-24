import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

import { readAiConfig } from '../ai.config';
import { AiUsage, usageFrom } from '../ai-usage';
import { AiChatProvider, AiChatRequest, AiChatResponse } from './ai-chat-provider';

/** Models that accept the server-side refusal fallback (re-runs a declined turn on a sibling model). */
const FALLBACK_MODELS = /^claude-(opus-5-5|sonnet-5-5|fable-5-[12]|opus-5)$/;
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

/**
 * Manual tool loop over the Messages API: the model calls our catalogue tools,
 * we run them and hand back the rows, until it answers in text.
 * Every round is streamed so the answer text reaches the visitor as it is written.
 */
@Injectable()
export class AnthropicChatProvider implements AiChatProvider {
  constructor(private readonly config: ConfigService) {}

  async chat(request: AiChatRequest): Promise<AiChatResponse> {
    const { apiKey } = readAiConfig(this.config);
    if (!apiKey) throw new Error('AI provider is not configured');

    const client = new Anthropic({ apiKey, timeout: request.timeoutMs, maxRetries: 1 });
    // The tool list and the main system prompt never change between requests, so they are
    // marked for prompt caching: repeat visitors pay the cache-read price for them.
    const tools: Anthropic.Tool[] = request.tools.map((tool, index, all) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.schema as Anthropic.Tool.InputSchema,
      ...(index === all.length - 1 ? { cache_control: { type: 'ephemeral' as const } } : {}),
    }));
    const system: Anthropic.TextBlockParam[] = [
      { type: 'text', text: request.system, cache_control: { type: 'ephemeral' } },
      ...(request.systemSuffix ? [{ type: 'text' as const, text: request.systemSuffix }] : []),
    ];
    const messages: Anthropic.MessageParam[] = request.history.map((turn) =>
      turn.image && turn.role === 'user'
        ? {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: turn.image.mediaType, data: turn.image.data },
              },
              { type: 'text', text: turn.text },
            ],
          }
        : { role: turn.role, content: turn.text },
    );
    const withFallback = FALLBACK_MODELS.test(request.model);
    const usage: AiUsage[] = [];
    try {
      return await this.loop(client, request, { tools, system, messages, withFallback, usage });
    } catch (error) {
      // Rounds that finished before a timeout or abort were still billed: hand them back.
      throw Object.assign(error instanceof Error ? error : new Error(String(error)), { usage });
    }
  }

  private async loop(
    client: Anthropic,
    request: AiChatRequest,
    ctx: {
      tools: Anthropic.Tool[];
      system: Anthropic.TextBlockParam[];
      messages: Anthropic.MessageParam[];
      withFallback: boolean;
      usage: AiUsage[];
    },
  ): Promise<AiChatResponse> {
    const { tools, system, messages, withFallback, usage } = ctx;
    const deadline = Date.now() + request.timeoutMs;
    let text = '';

    for (let round = 0; round <= request.maxRounds; round += 1) {
      const lastRound = round === request.maxRounds;
      const remaining = Math.max(1_000, deadline - Date.now());
      // Fields newer than the installed SDK's types (effort, fallbacks) go through as plain body keys.
      const body = {
        model: request.model,
        max_tokens: request.maxTokens,
        system,
        tools,
        tool_choice: lastRound ? { type: 'none' as const } : { type: 'auto' as const },
        messages,
        output_config: { effort: request.effort },
        ...(withFallback ? { fallbacks: 'default' } : {}),
      } as unknown as Anthropic.MessageStreamParams;

      const timeout = AbortSignal.timeout(remaining);
      const stream = client.messages.stream(body, {
        signal: request.signal ? AbortSignal.any([timeout, request.signal]) : timeout,
        ...(withFallback ? { headers: { 'anthropic-beta': FALLBACK_BETA } } : {}),
      });
      let roundText = '';
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          // Text after an earlier round's text starts a new paragraph.
          const piece = !roundText && text ? `\n\n${event.delta.text}` : event.delta.text;
          roundText += event.delta.text;
          text += piece;
          request.onText?.(piece);
        }
      }
      const response = await stream.finalMessage();
      usage.push(usageFrom(response.model || request.model, response.usage));

      if (response.stop_reason === 'refusal') return { text: '', refused: true, usage };

      const toolUses = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      );
      if (response.stop_reason !== 'tool_use' || toolUses.length === 0 || lastRound) {
        return { text: text.trim(), refused: false, usage };
      }

      request.onSearch?.();
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

    return { text: text.trim(), refused: false, usage };
  }
}
