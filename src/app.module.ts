import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from './database/redis.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    UsersModule, // Example module where you'll create entities
    CatsModule,
    AuthModule,
    DatabaseModule,
  ],
  providers: [
    JwtService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
