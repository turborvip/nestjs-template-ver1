import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    if (user) {
      if (user.password === pass) {
        const { password, ...result } = user;
        return result;
      } else {
        return {
          err: 'Wrong password',
        };
      }
    }
    return {
      err: 'User not found',
    };
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    const payload = {
      username: user.username,
      sub: user.userId,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
