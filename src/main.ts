import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
var serviceAccount = require(`${process.env.PATH_SERVICE_ACC_KEY}`);

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  initializeApp({
    credential: credential.cert(serviceAccount),
  });

  app.enableVersioning({
    type: VersioningType.URI, // Choose your preferred type
  });

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('CTUE API')
    .setDescription('A server built with Nestjs, Postgresql, Docker')
    .setVersion('1.0')
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api-swagger', app, document);

  await app.listen(AppModule.port || 8888);
}
bootstrap();
