
import {
    Controller,
    Get,
    Request,
  } from '@nestjs/common';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/roles.enum';
  
  @Controller('user')
  export class UsersController {

    constructor() {}
  
    @Get('profile')
    @Roles([Role.Admin])
    getProfile(@Request() req) {
      return "hi";
    }
  }
  