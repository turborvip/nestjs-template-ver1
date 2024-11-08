import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.login(signInDto.username, signInDto.password);
  }

  @Get('profile')
  @Public()
  getProfile(@Request() req) {
    return { user: req.user };
  }
}
