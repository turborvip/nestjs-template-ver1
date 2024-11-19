import { Controller, Get, Post, Request, Response, UseGuards } from '@nestjs/common';
import { Roles } from '../roles/roles.decorator';
import { Role } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@Controller('user')
@ApiTags('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @Roles([Role.Admin])
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Test authorization' })
  @ApiResponse({ status: 200, description: 'hi' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getProfile(@Request() req) {
    return 'hi';
  }

  @Post('change-password')
  @Roles([Role.Admin, Role.User])
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Test authorization' })
  @ApiResponse({ status: 200, description: 'hi' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async changePassword(@Request() req, @Response() res) {
    try {
      const user = req.user;
      const { username, oldPassword, newPassword } = req.body;
      await this.usersService.changePassword(user, username, oldPassword, newPassword);
      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
    
  }
}
