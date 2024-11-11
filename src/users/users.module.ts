import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtService } from '@nestjs/jwt';
@Module({
  providers: [UsersService, JwtService], // Register UsersService in the providers array
  controllers: [UsersController],
  exports: [UsersService], // Export UsersService so it can be used in other modules
})
export class UsersModule {}
