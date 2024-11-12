import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('user')
export class UsersController {
  constructor() {}

  @Get('profile')
  @Roles([Role.Admin])
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Test authorization' })
  @ApiResponse({ status: 200, description: 'hi' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getProfile(@Request() req) {
    return 'hi';
  }
}
