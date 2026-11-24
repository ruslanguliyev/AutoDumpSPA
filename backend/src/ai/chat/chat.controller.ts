import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
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
  DAILY_LIMIT: HttpStatus.TOO_MANY_REQUESTS,
  PAUSED: HttpStatus.SERVICE_UNAVAILABLE,
};

const codeOf = (error: unknown) =>
  error instanceof GraphQLError ? String(error.extensions?.code ?? 'UNAVAILABLE') : null;

const IMAGE_UPLOAD = FileInterceptor('image', {
  storage: memoryStorage(),
  limits: { fileSize: CHAT_IMAGE_MAX_BYTES, files: 1, fields: 2, fieldSize: 64 * 1024, parts: 3 },
});

function readImage(file?: Express.Multer.File) {
  if (!file) return null;
  try {
    return validateChatImage(file.buffer);
  } catch (error) {
    if (error instanceof ChatImageError) throw fail('INVALID_IMAGE');
    throw error;
  }
}

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
  @UseInterceptors(IMAGE_UPLOAD)
  async send(
    @Req() req: Request,
    @Body('payload') payload: unknown,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ChatReply> {
    const { messages, language } = readPayload(payload);
    const image = readImage(file);
    try {
      return await this.chat.reply(messages, language, req.ip ?? 'unknown', image);
    } catch (error) {
      const code = codeOf(error);
      if (code) throw fail(code);
      throw error;
    }
  }

  /**
   * The same chat, streamed as NDJSON lines so the answer appears while it is written:
   *   {"type":"searching"}            the model is searching the catalogue
   *   {"type":"text","text":"…"}      a piece of the answer
   *   {"type":"done","text":"…","cards":[…]}
   *   {"type":"error","code":"…"}     after the stream started
   * Errors found before anything is sent (limits, bad input) come back as a plain HTTP error.
   */
  @Post('chat/stream')
  @UseInterceptors(IMAGE_UPLOAD)
  async stream(
    @Req() req: Request,
    @Res() res: Response,
    @Body('payload') payload: unknown,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<void> {
    const abort = new AbortController();
    res.on('close', () => {
      if (!res.writableFinished) abort.abort();
    });
    const write = (event: Record<string, unknown>) => {
      if (!res.headersSent) {
        res.status(200);
        res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        // Tells nginx not to buffer, so lines reach the browser as they are written.
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
      }
      if (!res.writableEnded) res.write(`${JSON.stringify(event)}
`);
    };

    try {
      const { messages, language } = readPayload(payload);
      const image = readImage(file);
      const reply = await this.chat.reply(messages, language, req.ip ?? 'unknown', image, {
        onText: (text) => write({ type: 'text', text }),
        onSearch: () => write({ type: 'searching' }),
        signal: abort.signal,
      });
      write({ type: 'done', text: reply.text, cards: reply.cards });
      res.end();
    } catch (error) {
      const code =
        codeOf(error) ??
        (error instanceof HttpException ? String((error.getResponse() as { code?: string })?.code ?? '') : '') ??
        '';
      if (abort.signal.aborted) {
        res.end();
        return;
      }
      if (!res.headersSent) {
        const status = STATUS_BY_CODE[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
        res.status(status).json({ code: code || 'UNAVAILABLE' });
        return;
      }
      write({ type: 'error', code: code || 'UNAVAILABLE' });
      res.end();
    }
  }
}
