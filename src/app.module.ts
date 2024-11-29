import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from './database/redis.service';
import { DatabaseModule } from './database/database.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { RolesGuard } from './guards/roles.guard';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CatchEverythingFilter } from './filters/catchEveryThing.filter';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule, // Example module where you'll create entities
    CatsModule,
    AuthModule,
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env.production'],
      isGlobal: true,
    })
  ],
  providers: [
    JwtService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}