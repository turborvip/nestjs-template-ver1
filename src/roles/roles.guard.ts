// auth/roles.guard.ts
import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './roles.enum';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../auth/constants';

@Injectable()
export class RolesGuard extends JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {
    super(); // Calls the base JwtAuthGuard constructor
  }

  // Override the canActivate method to check roles
  canActivate(context: ExecutionContext): boolean {
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
    // encrypt token using secret key
    try {
      const decoded = this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      }); // Verifying the token
      console.log('Decoded token:', decoded);

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

      return true;
    } catch (error) {
      console.error('Error verifying token:', error.message);
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
