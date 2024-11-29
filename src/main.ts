import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

export async function bootstrap(): Promise<INestApplication> {
  
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log('process.env.NODE_ENV', process.env.NODE_ENV);
  // Load file .env phù hợp
  dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The NestJS API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    customSiteTitle: 'API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(parseInt(process.env.PORT) || 3000, process.env.HOST, () => {
    console.log(
      `Server running on http://localhost:${process.env.PORT || 3000}`,
    );
  });
  return app;
}
bootstrap();
