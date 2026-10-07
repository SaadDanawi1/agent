import { Permission, userHasPermission, getUserPermissions } from './rolePermissions';
import { UserRole } from '@delivery/types/roles';
import { AuthUser } from '@delivery/types/users';

export interface PermissionContext {
  user: AuthUser;
  resourceOwnerId?: string;
}

export class PermissionsService {
  static can(permission: Permission, context: PermissionContext): boolean {
    return userHasPermission(context.user.roles, permission);
  }

  static canAll(permissions: Permission[], context: PermissionContext): boolean {
    return userHasAllPermissions(context.user.roles, permissions);
  }

  static canAny(permissions: Permission[], context: PermissionContext): boolean {
    return userHasAnyPermission(context.user.roles, permissions);
  }

  static isOwner(context: PermissionContext): boolean {
    if (!context.resourceOwnerId) return false;
    return context.user.id === context.resourceOwnerId;
  }

  static canAccessResource(context: PermissionContext): boolean {
    if (this.isOwner(context)) return true;
    
    // Check for elevated permissions
    const elevatedPermissions = [
      Permission.ORDERS_VIEW_ALL,
      Permission.CUSTOMERS_VIEW_ORDERS,
      Permission.DRIVERS_VIEW_EARNINGS,
      Permission.MERCHANTS_VIEW_ORDERS,
    ];
    
    return this.canAny(elevatedPermissions, context);
  }

  static getPermissions(user: AuthUser): Permission[] {
    return getUserPermissions(user.roles);
  }

  static hasRole(user: AuthUser, role: UserRole): boolean {
    return user.roles.includes(role);
  }

  static hasAnyRole(user: AuthUser, roles: UserRole[]): boolean {
    return user.roles.some(r => roles.includes(r));
  }

  static getPrimaryRole(user: AuthUser): UserRole {
    return user.primaryRole;
  }
}

// Decorator for backend (used with PermissionsGuard)
export const RequirePermissions = (...permissions: Permission[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // This is handled by the PermissionsGuard via metadata
    return descriptor;
  };
};

export const RequireRoles = (...roles: UserRole[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  };
};