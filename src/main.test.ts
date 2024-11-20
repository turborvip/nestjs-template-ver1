import { bootstrap } from './main';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

// Mock các thư viện sử dụng trong file chính
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(() => ({
      listen: jest.fn().mockImplementation(() => {
        //   return new Promise((resolve, reject) => {
        //     // Bạn có thể tùy chỉnh việc reject hoặc resolve tại đây
        //     reject(new Error('Port already in use'));  // Mô phỏng lỗi
        //   });
      }),
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
    // Tạo mock ứng dụng NestJS
    app = {
      listen: jest.fn(),
      close: jest.fn(),
    } as unknown as INestApplication;

    // Mock NestFactory.create trả về ứng dụng mock
    (NestFactory.create as jest.Mock).mockResolvedValue(app);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Xóa các mock sau mỗi bài kiểm tra
  });

  it('should call dotenv.config to load environment variables', async () => {
    await bootstrap();
    expect(dotenv.config).toHaveBeenCalled(); // Đảm bảo dotenv.config được gọi
  });

  it('should create a Nest application using AppModule', async () => {
    await bootstrap();
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule); // Kiểm tra AppModule được sử dụng
  });

  it('should set up Swagger with the correct configuration', async () => {
    await bootstrap();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api',
      app,
      expect.any(Function), // Hàm tạo document
      expect.objectContaining({
        customSiteTitle: 'API Documentation',
        swaggerOptions: { persistAuthorization: true },
      }),
    );
  });

  it('should listen on the default port 3000 when no environment variable is set', async () => {
    delete process.env.PORT; // Không đặt PORT
    await bootstrap();
    expect(app.listen).toHaveBeenCalledWith(3000); // Kiểm tra cổng mặc định
  });

  it('should listen on the specified port from environment variable', async () => {
    process.env.PORT = '4000'; // Đặt PORT trong biến môi trường
    await bootstrap();
    expect(app.listen).toHaveBeenCalledWith('4000'); // Kiểm tra cổng được chỉ định
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
      expect(error.message).toBe(errorMessage); // Kiểm tra lỗi khi setup Swagger
    }
  });

  //   it('should handle error if app.listen fails', async () => {
  //     const errorMessage = 'Port already in use';

  //     // Đảm bảo listen trả về một Promise và mock bị reject
  //     try {
  //       await bootstrap();
  //     } catch (error) {
  //       expect(error.message).toBe(errorMessage); // Kiểm tra lỗi khi app.listen thất bại
  //     }
  //   });
});
