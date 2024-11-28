import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../constants/roles.enum';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { User } from '../decorators/user.decorator';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(LoggingInterceptor)
@ApiTags('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @Roles([Role.Admin])
  @ApiOperation({ summary: 'User' })
  @ApiResponse({ status: 200, description: 'hi' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getProfile() {
    return 'hi';
  }

  @Post('change-password')
  @Roles([Role.Admin, Role.User])
  @ApiOperation({ summary: 'User' })
  @ApiResponse({ status: 200, description: 'hi' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async changePassword(@User() user, @Request() req, @Response() res) {
    try {
      const { username, oldPassword, newPassword } = req.body;
      await this.usersService.changePassword(
        user,
        username,
        oldPassword,
        newPassword,
      );
      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'User' })
  @ApiResponse({ status: 200, description: 'created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async register(@Response() res, @Body() dataBody: CreateUserDto) {
    try {
      const dataUser = await this.usersService.register(dataBody);
      res.status(201).json({ data: dataUser, msg: 'created user success!' });
    } catch (error) {
      res.status(500).json({ msg: error?.detail || 'Internal server error' });
    }
  }
}
