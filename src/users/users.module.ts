import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtService } from '@nestjs/jwt';
import { userProviders } from './user.providers';
import { DatabaseModule } from '../database/database.module';
import { RedisService } from '../database/redis.service';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [DatabaseModule],
  providers: [...userProviders, UsersService, JwtService, RedisService, ConfigService], // Register UsersService in the providers array
  controllers: [UsersController],
  exports: [UsersService,RedisService], // Export UsersService so it can be used in other modules
})
export class UsersModule {}
