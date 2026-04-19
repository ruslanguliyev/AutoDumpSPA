import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 4000;

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(port);
}

bootstrap();
