import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { RedisService } from '../database/redis.service';
import { DatabaseModule } from '../database/database.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'), // Lấy giá trị từ ConfigService
        signOptions: { expiresIn: '3m' },
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RedisService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
