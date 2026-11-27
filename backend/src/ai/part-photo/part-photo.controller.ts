import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { GraphQLError } from 'graphql';
import { memoryStorage } from 'multer';

import type { AuthUser } from '../../auth/auth.types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from '../ai.service';
import { AiLanguage } from '../ai.types';
import { CHAT_IMAGE_MAX_BYTES, ChatImageError, validateChatImage } from '../chat/chat-image';
import type { PartPhotoResult } from './part-photo-result';

const STATUS_BY_CODE: Record<string, HttpStatus> = {
  RATE_LIMITED: HttpStatus.TOO_MANY_REQUESTS,
  UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE,
  INVALID_INPUT: HttpStatus.BAD_REQUEST,
  INVALID_IMAGE: HttpStatus.BAD_REQUEST,
  INVALID_RESULT: HttpStatus.BAD_GATEWAY,
  DAILY_LIMIT: HttpStatus.TOO_MANY_REQUESTS,
  PAUSED: HttpStatus.SERVICE_UNAVAILABLE,
};

const fail = (code: string) =>
  new HttpException({ code }, STATUS_BY_CODE[code] ?? HttpStatus.INTERNAL_SERVER_ERROR);

const LANGUAGES = new Set<string>(Object.values(AiLanguage));

/**
 * "Fill with AI" in the parts listing wizard: the seller sends a photo of the part and gets
 * suggested fields back. Signed-in sellers only. The photo is held in memory, checked byte by
 * byte with the same rules as the assistant chat, forwarded to the model and dropped.
 */
@Controller('ai')
export class PartPhotoController {
  constructor(private readonly ai: AiService) {}

  @Post('part-photo')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: CHAT_IMAGE_MAX_BYTES, files: 1, fields: 2, fieldSize: 64, parts: 3 },
    }),
  )
  async recognize(
    @Req() req: Request & { user: AuthUser },
    @Body('language') language: unknown,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<PartPhotoResult> {
    if (!LANGUAGES.has(String(language))) throw fail('INVALID_INPUT');
    if (!file) throw fail('INVALID_IMAGE');
    let image;
    try {
      image = validateChatImage(file.buffer);
    } catch (error) {
      if (error instanceof ChatImageError) throw fail('INVALID_IMAGE');
      throw error;
    }
    try {
      return await this.ai.recognizePart(req.user.id, image, language as AiLanguage);
    } catch (error) {
      if (error instanceof GraphQLError) throw fail(String(error.extensions?.code ?? 'UNAVAILABLE'));
      throw error;
    }
  }
}
