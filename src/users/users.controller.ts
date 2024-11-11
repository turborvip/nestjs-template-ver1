import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';

@Controller('user')
export class UsersController {
  constructor() {}

  @Get('profile')
  @Roles([Role.Admin])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @UseGuards(RolesGuard)
  getProfile(@Request() req) {
    return 'hi';
  }
}
