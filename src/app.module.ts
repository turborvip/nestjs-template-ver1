import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './database/redis.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config accessible globally
      envFilePath: '.env', // Specify the path to your .env file
    }),
    UsersModule, // Example module where you'll create entities
    CatsModule,
    AuthModule,
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
