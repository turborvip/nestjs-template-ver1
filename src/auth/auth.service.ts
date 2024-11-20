import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { hashUtil } from '../util/hash.util';
import { RedisService } from '../database/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);

    if (user) {
      const checkPass = await hashUtil.compare(pass, user.password);
      if (checkPass) {
        delete user.password;
        return user;
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
    if (user?.err) {
      throw new UnauthorizedException(user.err);
    }
    const payload = {
      username: user.username,
      sub: user.userId,
      roles: user.roles,
    };
    const token = this.jwtService.sign(payload);
    return {
      message: 'success',
      access_token: token,
    };
  }

  async logout(token: string): Promise<void> {
    await this.redisService.addToBlacklist({ token });
  }
}
