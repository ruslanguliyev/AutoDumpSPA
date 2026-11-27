import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PartTranslationService } from './part-translation.service';
import { TextTranslationService } from './text-translation.service';
import { TextTranslationsResolver } from './text-translations.resolver';

@Module({
  imports: [PrismaModule, AiModule, AuthModule],
  providers: [PartTranslationService, TextTranslationService, TextTranslationsResolver],
  exports: [PartTranslationService, TextTranslationService],
})
export class TranslationsModule {}
