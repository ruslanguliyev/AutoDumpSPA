import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { getAllowedOrigins } from './common/config/cors';

async function bootstrap() {
  // rawBody: payment callbacks are signed over the exact bytes the provider sent.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  // Behind a reverse proxy, req.ip must be the visitor rather than the proxy, because
  // the anonymous checkout budgets are counted per caller.
  app.set('trust proxy', Number(process.env.TRUSTED_PROXY_HOPS ?? 1));
  // Serve uploaded files from the runtime working directory.
  // In dev/watch mode, relying on __dirname can point to different build paths.
  const uploadsPath = join(process.cwd(), 'uploads');
  mkdirSync(uploadsPath, { recursive: true });
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 4000;

  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
  });

  await app.listen(port);
}

bootstrap();
