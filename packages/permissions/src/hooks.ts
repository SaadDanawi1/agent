import { useAuth } from '@delivery/auth';
import { Permission, userHasPermission, getUserPermissions } from './rolePermissions';
import { UserRole } from '@delivery/types/roles';
import { useMemo } from 'react';

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return userHasPermission(user.roles, permission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.every(p => userHasPermission(user.roles, p));
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some(p => userHasPermission(user.roles, p));
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return user.roles.some(r => roles.includes(r));
  };

  const canAccessRoute = (requiredPermissions: Permission[]): boolean => {
    return hasAllPermissions(requiredPermissions);
  };

  const permissions = useMemo(() => 
    user ? getUserPermissions(user.roles) : [], 
    [user?.roles]
  );

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    canAccessRoute,
    permissions,
    userRoles: user?.roles || [],
    primaryRole: user?.primaryRole,
  };
}

export function PermissionGate({
  permissions = [],
  roles = [],
  children,
  fallback = null,
}: {
  permissions?: Permission[];
  roles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission, hasAnyRole } = usePermissions();

  const hasRequiredPermissions = permissions.every(hasPermission);
  const hasRequiredRoles = roles.length === 0 || hasAnyRole(roles);

  if (hasRequiredPermissions && hasRequiredRoles) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}