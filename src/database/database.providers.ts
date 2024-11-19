import Redis from 'ioredis';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE_POSTGRES',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'turborvip',
        password: '123456a',
        database: 'turborvip_db_postgresql', // Database 1
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
      });

      return dataSource.initialize();
    },
  },
  {
    provide: 'DATA_SOURCE_MYSQL', // Name of the second database provider
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'turborvip',
        password: '123456a',
        database: 'turborvip_db_mysql', // Database 2
        entities: [],
        synchronize: true,
        logging: false,
      });

      return dataSource.initialize();
    },
  },

  {
    provide: 'REDIS_CONNECTION', // Provider for Redis connection
    
    useFactory: async () => {
      const redis = new Redis({
        host: 'localhost',  // Redis server address (localhost or Redis container name)
        port: 6379,         // Redis server port
        password: '123456a', // Redis password (if set)
        db: 0,              // Redis database index (default is 0)
      });
      // Logging connection and disconnection events
      redis.on('connect', () => {
        console.log('Redis connected');
      });

      redis.on('ready', () => {
        console.log('Redis connection is ready');
      });

      redis.on('close', () => {
        console.log('Redis connection closed');
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
