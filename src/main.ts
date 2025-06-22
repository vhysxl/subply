import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  ); //bikin validasi jalan (DTO)

  const host = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 5000; //jalan di port 5000

  const config = new DocumentBuilder()
    .setTitle('Subply API example')
    .setDescription('This is subply api')
    .setVersion('1.0')
    .addTag('subply')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port, host);
}

void bootstrap();
