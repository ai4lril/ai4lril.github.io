import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestUser } from '../common/request-user.types';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // For now, permissions are based on roles
    // In the future, this can be extended to check specific permissions
    const userPermissions = this.getPermissionsForRole(user.role ?? 'USER');

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private getPermissionsForRole(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      USER: ['contribute', 'validate', 'view_own_data', 'export_own_data'],
      MODERATOR: [
        'contribute',
        'validate',
        'view_own_data',
        'export_own_data',
        'moderate_content',
        'view_all_content',
      ],
      ADMIN: [
        'contribute',
        'validate',
        'view_own_data',
        'export_own_data',
        'moderate_content',
        'view_all_content',
        'manage_users',
        'view_analytics',
        'export_data',
        'manage_system',
      ],
      SUPER_ADMIN: [
        'contribute',
        'validate',
        'view_own_data',
        'export_own_data',
        'moderate_content',
        'view_all_content',
        'manage_users',
        'view_analytics',
        'export_data',
        'manage_system',
        'manage_admins',
        'system_config',
      ],
    };

    return rolePermissions[role] || [];
  }
}
