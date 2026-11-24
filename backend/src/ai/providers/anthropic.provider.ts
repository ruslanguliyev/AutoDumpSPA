import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

import { readAiConfig } from '../ai.config';
import { usageFrom } from '../ai-usage';
import { AiCompletionRequest, AiProvider } from './ai-provider';

@Injectable()
export class AnthropicAiProvider implements AiProvider {
  constructor(private readonly config: ConfigService) {}

  async complete(request: AiCompletionRequest): Promise<unknown> {
    const { apiKey, timeoutMs } = readAiConfig(this.config);
    if (!apiKey) throw new Error('AI provider is not configured');

    const client = new Anthropic({ apiKey, timeout: timeoutMs });
    const message = await client.messages.create(
      {
        model: request.model,
        max_tokens: request.maxTokens,
        // Claude 5.5 models reject a non-default temperature and a forced tool_choice,
        // so the prompt asks for the tool and a missing tool call is treated as a failure below.
        system: request.system,
        tool_choice: { type: 'auto' },
        tools: [
          {
            name: request.tool.name,
            description: request.tool.description,
            input_schema: request.tool.schema as Anthropic.Tool.InputSchema,
          },
        ],
        messages: [{ role: 'user', content: request.user }],
      },
      { signal: AbortSignal.timeout(request.timeoutMs) },
    );

    request.onUsage?.(usageFrom(message.model || request.model, message.usage));
    const block = message.content.find(
      (item) => item.type === 'tool_use' && item.name === request.tool.name,
    );
    if (!block || block.type !== 'tool_use') {
      throw new Error('Model returned no tool result');
    }
    return block.input;
  }
}
