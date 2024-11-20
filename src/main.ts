import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export async function bootstrap(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

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

  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'], // Địa chỉ Kafka broker
      },
      consumer: {
        groupId: 'my-consumer-group', // Tên group cho consumer
      },
    },
  };

  app.connectMicroservice(microserviceOptions);

  await app.startAllMicroservices(); // Bắt đầu tất cả microservices
  await app.listen(process.env.PORT || 3000);
  return app;
}
bootstrap();
