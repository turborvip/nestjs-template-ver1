import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

let documentFactory: OpenAPIObject | (() => OpenAPIObject);
export async function bootstrap(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The NestJS API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    customSiteTitle: 'API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(parseInt(process.env.PORT) || 3000);
  return app;
}
bootstrap();
export { documentFactory };