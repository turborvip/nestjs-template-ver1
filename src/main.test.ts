import { bootstrap } from './main';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(() => ({
      listen: jest.fn().mockImplementation(() => {}),
      close: jest.fn(),
    })),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  ...jest.requireActual('@nestjs/swagger'),
  ApiOperation: jest.fn(() => () => {}),
  ApiResponse: jest.fn(() => () => {}),
  SwaggerModule: {
    setup: jest.fn(),
    createDocument: jest.fn(() => ({ info: { title: 'Mock API' } })),
  },
}));

describe('Bootstrap Function', () => {
  let app: INestApplication;

  beforeEach(() => {
    app = {
      listen: jest.fn(),
      close: jest.fn(),
    } as unknown as INestApplication;

    (NestFactory.create as jest.Mock).mockResolvedValue(app);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call dotenv.config to load environment variables', async () => {
    await bootstrap();
    expect(dotenv.config).toHaveBeenCalled();
  });

  it('should create a Nest application using AppModule', async () => {
    await bootstrap();
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it('should set up Swagger with the correct configuration', async () => {
    await bootstrap();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api',
      app,
      expect.any(Function),
      expect.objectContaining({
        customSiteTitle: 'API Documentation',
        swaggerOptions: { persistAuthorization: true },
      }),
    );
  });

  it('should listen on the default port 3000 when no environment variable is set', async () => {
    delete process.env.PORT;
    await bootstrap();
    expect(app.listen).toHaveBeenCalledWith(3000);
  });

  it('should listen on the specified port from environment variable', async () => {
    process.env.PORT = '4000';
    await bootstrap();
    expect(app.listen).toHaveBeenCalledWith(4000);
  });

  it('should handle error if NestFactory.create fails', async () => {
    (NestFactory.create as jest.Mock).mockRejectedValue(
      new Error('Failed to create app'),
    );

    try {
      await bootstrap();
    } catch (error) {
      expect(error).toEqual(new Error('Failed to create app'));
    }
  });

  it('should handle error if Swagger setup fails', async () => {
    const errorMessage = 'Failed to setup Swagger';
    (SwaggerModule.setup as jest.Mock).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    try {
      await bootstrap();
    } catch (error) {
      expect(error.message).toBe(errorMessage);
    }
  });
  
});
