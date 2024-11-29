import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { DatabaseModule } from './database.module';
import { databaseProviders } from './database.providers';
import Redis from 'ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('RedisService', () => {
  let service: RedisService;
  let redisClient: Redis;
  let configService: ConfigService;

  beforeEach(async () => {
    jest.restoreAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, ConfigModule],
      providers: [RedisService, ...databaseProviders],
    }).compile();
    redisClient = await databaseProviders
      .find((provider) => provider.provide === 'REDIS_CONNECTION')
      .useFactory(configService);

    service = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    if (redisClient && typeof redisClient.quit === 'function') {
      await redisClient.quit();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt and decrypt value', async () => {
    try {
      const value = { message: 'test' };
      await service.setKeyWithEncrypt({
        key: 'test',
        value: JSON.stringify(value),
      });
      const decrypted = await service.getKeyWithDecrypt('test');
      expect(decrypted).toEqual(value);
    } catch (error) {
      console.log(error);
    }
  });

  it('encrypt with error', async () => {
    try {
      service.encrypt(null);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe('No text provided for encryption');
    }
  });

  it('decrypt with wrong text', async () => {
    try {
      service.decrypt('test');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe('Invalid encrypted text format');
    }
  });

  it('decrypt with null text', async () => {
    try {
      service.decrypt(null);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe('No encrypted text provided for decryption');
    }
  });

  it('set and key normal', async () => {
    const value = { message: 'test' };
    await service.setKey({
      key: 'test',
      value: JSON.stringify(value),
    });
    const resultGet = await service.getKey('test');
    expect(value).toEqual(JSON.parse(resultGet));
  });

  it('del key normal', async () => {
    const value = { message: 'test' };
    service.setKey({
      key: 'test',
      value: JSON.stringify(value),
    });

    const resultGetBefore = await service.getKey('test');
    expect(resultGetBefore).toBeDefined();

    await service.delKey('test');
    const resultGetAfter = await service.getKey('test');
    expect(resultGetAfter).toBeNull();
  });

  it('exists key normal', async () => {
    const value = { message: 'test' };
    await service.setKey({
      key: 'test',
      value: JSON.stringify(value),
    });
    const resultExists = await service.existsKey('test');
    expect(resultExists).toBeDefined();
  });

  it('should add and check token in blacklist', async () => {
    const token = 'test-token';
    await service.addToBlacklist({ token });
    expect(await service.isTokenBlacklisted(token)).toBeTruthy();
    await service.removeFromBlacklist(token);
    expect(await service.isTokenBlacklisted(token)).toBeFalsy();
  });

  it('should handle Redis close event', () => {
    const spyConsoleLog = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    redisClient.emit('close'); // Kích hoạt sự kiện 'close' (Redis sẽ phát ra sự kiện này)

    expect(spyConsoleLog).toHaveBeenCalledWith('Redis connection closed');

    spyConsoleLog.mockRestore();
  });

  it('should handle Redis error event', () => {
    const spyConsoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockError = new Error('Mock Redis error');

    redisClient.emit('error', mockError); // Kích hoạt sự kiện 'error'

    expect(spyConsoleError).toHaveBeenCalledWith(
      'Redis connection error:',
      mockError,
    );

    spyConsoleError.mockRestore();
  });

  it('should handle Redis reconnecting event', () => {
    const spyConsoleLog = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    redisClient.emit('reconnecting'); // Kích hoạt sự kiện 'reconnecting'

    expect(spyConsoleLog).toHaveBeenCalledWith('Redis is reconnecting...');

    spyConsoleLog.mockRestore();
  });
});
