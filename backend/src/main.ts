import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Serve uploaded files from the runtime working directory.
  // In dev/watch mode, relying on __dirname can point to different build paths.
  const uploadsPath = join(process.cwd(), 'uploads');
  mkdirSync(uploadsPath, { recursive: true });
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 4000;

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(port);
}

bootstrap();
