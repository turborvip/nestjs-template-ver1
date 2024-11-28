import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorators/public.decorator';
import { Role } from '../constants/roles.enum';
import { Roles } from '../decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async signIn(@Body() signInDto: Record<string, any>, @Response() res) {
    try {
      const result = await this.authService.login(
        signInDto.username,
        signInDto.password,
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error?.status || 500).json({ error: error.message });
    }
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
}
