const Redis = require('ioredis');
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE_POSTGRES',
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get<string>('HOST_POSTGRES'),
        port: configService.get<number>('PORT_POSTGRES'),
        username: configService.get<string>('USERNAME_POSTGRES'),
        password: configService.get<string>('PASSWORD_POSTGRES'),
        database: configService.get<string>('NAME_DATABASE_POSTGRES'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
        extra: {
          connectionLimit: parseInt(process.env.CONNECT_POOL_POSTGRES), // Connection pooling
        },
      });

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
  {
    provide: 'DATA_SOURCE_MYSQL', // Name of the second database provider
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: configService.get<string>('HOST_MYSQL'),
        port: configService.get<number>('PORT_MYSQL'),
        username: configService.get<string>('USERNAME_MYSQL'),
        password: configService.get<string>('PASSWORD_MYSQL'),
        database: configService.get<string>('NAME_DATABASE_MYSQL'), // Database 2
        entities: [],
        synchronize: true,
        logging: false,
        extra: {
          connectionLimit: configService.get<number>('CONNECT_POOL_MYSQL'), // Connection pooling
        },
      });

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
  {
    provide: 'REDIS_CONNECTION', // Provider for Redis connection

    useFactory: async (configService: ConfigService) => {
      const redis = new Redis({
        host: configService.get<string>('HOST_REDIS'), // Redis server address (localhost or Redis container name)
        port: configService.get<number>('PORT_REDIS'), // Redis server port
        password: configService.get<string>('PASSWORD_REDIS'), // Redis password (if set)
        db: 0, // Redis database index (default is 0)
      });
      // Logging connection and disconnection events
      redis.on('connect', () => {
        console.log('Redis connected');
      });

      redis.on('ready', () => {
        console.log('Redis connection is ready');
      });

      redis.on('close', () => {
        console.warn('Redis connection closed');
      });

      redis.on('error', (err) => {
        console.error('Redis connection error:', err);
      });

      redis.on('reconnecting', () => {
        console.log('Redis is reconnecting...');
      });
      return redis;
    },
    inject: [ConfigService],
  },
];
