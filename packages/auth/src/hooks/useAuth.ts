import { useAuth } from './context/AuthContext';
import { Permission } from '@delivery/permissions';
import { UserRole } from '@delivery/types/roles';
import { userHasPermission } from '@delivery/permissions/rolePermissions';

export function useAuthPermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return userHasPermission(user.roles, permission);
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
    return requiredPermissions.every(hasPermission);
  };

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccessRoute,
    userRoles: user?.roles || [],
    primaryRole: user?.primaryRole,
    permissions: user?.permissions || [],
  };
}

export function useAuthUser() {
  const { user } = useAuth();
  return user;
}

export function useAuthLoading() {
  const { loading } = useAuth();
  return loading;
}

export function useLogout() {
  const { logout } = useAuth();
  return logout;
}

export function useSwitchRole() {
  const { switchRole } = useAuth();
  return switchRole;
}