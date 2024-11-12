import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private moduleRef: ModuleRef,
  ) {
    super({
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    username: string,
    password: string,
  ): Promise<any> {
    // const contextId = ContextIdFactory.getByRequest(request);
    // // "AuthService" is a request-scoped provider
    // const authService = await this.moduleRef.resolve(AuthService, contextId);
    const result = await this.authService.validateUser(username, password);
    if (!result) {
      throw new UnauthorizedException();
    }
    if(result.err){
      throw new UnauthorizedException(result.err);
    }
    return result;
  }
}
