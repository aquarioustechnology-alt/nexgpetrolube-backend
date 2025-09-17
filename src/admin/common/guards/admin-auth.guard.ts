import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AdminRolesGuard } from './admin-roles.guard';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private jwtAuthGuard: JwtAuthGuard;
  private adminRolesGuard: AdminRolesGuard;

  constructor(private reflector: Reflector) {
    this.jwtAuthGuard = new JwtAuthGuard(this.reflector);
    this.adminRolesGuard = new AdminRolesGuard(this.reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check JWT authentication
    const isAuthenticated = await this.jwtAuthGuard.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    // Then check admin roles
    return this.adminRolesGuard.canActivate(context);
  }
}
