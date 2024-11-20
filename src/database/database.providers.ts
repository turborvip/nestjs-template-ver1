const Redis = require('ioredis');
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE_POSTGRES',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.HOST_POSTGRES,
        port: parseInt(process.env.PORT_POSTGRES),
        username: process.env.USERNAME_POSTGRES,
        password: process.env.PASSWORD_POSTGRES,
        database: process.env.NAME_DATABASE_POSTGRES,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
        extra: {
          connectionLimit: parseInt(process.env.CONNECT_POOL_POSTGRES), // Connection pooling
        },
      });

      return dataSource.initialize();
    },
  },
  {
    provide: 'DATA_SOURCE_MYSQL', // Name of the second database provider
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.HOST_MYSQL,
        port: parseInt(process.env.PORT_MYSQL),
        username: process.env.USERNAME_MYSQL,
        password: process.env.PASSWORD_MYSQL,
        database: process.env.NAME_DATABASE_MYSQL, // Database 2
        entities: [],
        synchronize: true,
        logging: false,
        extra: {
          connectionLimit: parseInt(process.env.CONNECT_POOL_MYSQL), // Connection pooling
        },
      });

      return dataSource.initialize();
    },
  },

  {
    provide: 'REDIS_CONNECTION', // Provider for Redis connection

    useFactory: async () => {
      const redis = new Redis({
        host: process.env.HOST_REDIS, // Redis server address (localhost or Redis container name)
        port: parseInt(process.env.PORT_REDIS), // Redis server port
        password: process.env.PASSWORD_REDIS, // Redis password (if set)
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
  },
];
