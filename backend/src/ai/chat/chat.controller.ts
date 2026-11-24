import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { GraphQLError } from 'graphql';
import { memoryStorage } from 'multer';

import { AiLanguage } from '../ai.types';
import { CHAT_IMAGE_MAX_BYTES, ChatImageError, validateChatImage } from './chat-image';
import { AiChatService, ChatMessage, ChatReply } from './chat.service';

const STATUS_BY_CODE: Record<string, HttpStatus> = {
  RATE_LIMITED: HttpStatus.TOO_MANY_REQUESTS,
  UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE,
  INVALID_INPUT: HttpStatus.BAD_REQUEST,
  INVALID_IMAGE: HttpStatus.BAD_REQUEST,
  INVALID_RESULT: HttpStatus.BAD_GATEWAY,
};

const fail = (code: string) =>
  new HttpException({ code }, STATUS_BY_CODE[code] ?? HttpStatus.INTERNAL_SERVER_ERROR);

const LANGUAGES = new Set<string>(Object.values(AiLanguage));

/** `payload` is a JSON string: { messages: [{ role, text }], language }. */
function readPayload(raw: unknown): { messages: ChatMessage[]; language: AiLanguage } {
  let parsed: unknown;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : null;
  } catch {
    throw fail('INVALID_INPUT');
  }
  const value = parsed as { messages?: unknown; language?: unknown } | null;
  if (!value || !Array.isArray(value.messages) || !LANGUAGES.has(String(value.language))) {
    throw fail('INVALID_INPUT');
  }
  const messages = value.messages.slice(-40).map((item) => {
    const message = item as { role?: unknown; text?: unknown };
    return {
      role: message?.role === 'ASSISTANT' ? 'ASSISTANT' : 'USER',
      text: typeof message?.text === 'string' ? message.text : '',
    } as ChatMessage;
  });
  return { messages, language: value.language as AiLanguage };
}

/**
 * The assistant chat with a photo. GraphQL keeps carrying text-only messages; a photo comes
 * here as multipart so the JSON body limit stays small for everything else.
 * The file is held in memory only, checked byte by byte, forwarded to the model and dropped.
 */
@Controller('ai')
export class AiChatController {
  constructor(private readonly chat: AiChatService) {}

  @Post('chat')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: CHAT_IMAGE_MAX_BYTES, files: 1, fields: 2, fieldSize: 64 * 1024, parts: 3 },
    }),
  )
  async send(
    @Req() req: Request,
    @Body('payload') payload: unknown,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ChatReply> {
    const { messages, language } = readPayload(payload);
    let image = null;
    if (file) {
      try {
        image = validateChatImage(file.buffer);
      } catch (error) {
        if (error instanceof ChatImageError) throw fail('INVALID_IMAGE');
        throw error;
      }
    }
    try {
      return await this.chat.reply(messages, language, req.ip ?? 'unknown', image);
    } catch (error) {
      if (error instanceof GraphQLError) throw fail(String(error.extensions?.code ?? 'UNAVAILABLE'));
      throw error;
    }
  }
}
