import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { RedisService } from '../database/redis.service';
import { DatabaseModule } from '../database/database.module';
require('dotenv').config();

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '3m' },
    }),
    DatabaseModule
  ],
  controllers: [AuthController],
  providers: [AuthService, RedisService],
  exports: [AuthService],
})
export class AuthModule {}
