import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Menggunakan IP lokal dan port yang ditentukan oleh environment variable atau fallback ke 5000
  const host = process.env.HOST || '0.0.0.0'; // 0.0.0.0 agar bisa diakses dari perangkat lain dalam jaringan yang sama
  const port = process.env.PORT || 5000;

  await app.listen(port, host);
}

void bootstrap();
