import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PartTranslationService } from './part-translation.service';

@Module({
  imports: [PrismaModule, AiModule],
  providers: [PartTranslationService],
  exports: [PartTranslationService],
})
export class TranslationsModule {}
