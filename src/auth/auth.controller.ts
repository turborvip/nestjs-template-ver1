import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { Role } from '../roles/roles.enum';
import { Roles } from '../roles/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async signIn(@Body() signInDto: Record<string, any>) {
    return await this.authService.login(signInDto.username, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @Roles([Role.Admin, Role.User])
  async signOut(@Request() req, @Response() res) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      await this.authService.logout(token);
      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @Get('profile')
  @Public()
  getProfile(@Request() req) {
    return { user: req.user };
  }
}
