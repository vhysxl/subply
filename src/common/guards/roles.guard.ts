import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../constants/role.enum';
import { ROLES_KEY } from '../decorator/role.decorator';
import { User } from 'src/users/interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<{ user: User }>();
    console.log(user);
    if (!user) {
      return false;
    }
    console.log(user);

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
