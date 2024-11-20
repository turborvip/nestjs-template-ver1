import { Test, TestingModule } from '@nestjs/testing';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { app } from './main';

describe('Bootstrap Function', () => {

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await app.close();
  })

  it('should create an app and setup Swagger', async () => {
    const config = new DocumentBuilder()
      .setTitle('NestJS API')
      .setDescription('The NestJS API description')
      .setVersion('1.0')
      .addTag('cats')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    
    expect(document).toBeDefined();
    expect(document.info.title).toBe('NestJS API');
  },10000);

  it('should listen on the default port', async () => {
    await app.listen(3000);
    expect(app.getHttpServer().listening).toBe(true);
  },10000);
});
