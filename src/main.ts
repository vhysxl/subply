import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 5000;

  await app.listen(port, host);
}

void bootstrap();
