// auth/roles.guard.ts
import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './roles.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RedisService } from '../database/redis.service';

@Injectable()
export class RolesGuard extends JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {
    super(); // Calls the base JwtAuthGuard constructor
  }

  // Override the canActivate method to check roles
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    ); // Get roles from metadata
    if (!requiredRoles) {
      return true; // No roles specified, allow access
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    const checkTokenBlacklist =
      await this.redisService.isTokenBlacklisted(token);
    if (checkTokenBlacklist) {
      throw new UnauthorizedException('Token is blacklisted');
    }
    // encrypt token using secret key
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      }); // Verifying the token
      // console.log('Decoded token:', decoded);

      // Add your role-checking logic here
      // Example: Check if the user has the required role
      const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );
      if (requiredRoles && !this.hasRequiredRole(decoded, requiredRoles)) {
        console.log('User does not have required roles');
        throw new UnauthorizedException('Insufficient permissions');
      }
      const request = context.switchToHttp().getRequest();
      request.user = decoded;
      return true;
    } catch (error) {
      console.info('Error verifying token:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private hasRequiredRole(decodedToken: any, requiredRoles: string[]): boolean {
    // Example role-checking logic; replace 'roles' with the actual property
    const userRoles = decodedToken.roles || [];
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
