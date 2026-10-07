import { Permission, ALL_PERMISSIONS } from './permissions';
import { UserRole, ROLE_HIERARCHY, getAllPermissionsForRole } from '@delivery/types/roles';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CUSTOMER]: [
    Permission.ORDERS_CREATE,
    Permission.ORDERS_READ,
    Permission.CHAT_READ,
    Permission.CHAT_SEND,
    Permission.WALLETS_READ,
    Permission.NOTIFICATIONS_SEND,
  ],

  [UserRole.DRIVER]: [
    Permission.ORDERS_READ,
    Permission.ORDERS_UPDATE,
    Permission.DRIVERS_READ,
    Permission.DRIVERS_UPDATE,
    Permission.DRIVERS_VIEW_EARNINGS,
    Permission.DRIVERS_VIEW_LOCATION,
    Permission.CHAT_READ,
    Permission.CHAT_SEND,
    Permission.WALLETS_READ,
    Permission.NOTIFICATIONS_SEND,
  ],

  [UserRole.MERCHANT]: [
    Permission.ORDERS_READ,
    Permission.ORDERS_UPDATE,
    Permission.MERCHANTS_READ,
    Permission.MERCHANTS_UPDATE,
    Permission.MERCHANTS_VIEW_ORDERS,
    Permission.MERCHANTS_VIEW_REVENUE,
    Permission.CHAT_READ,
    Permission.CHAT_SEND,
    Permission.WALLETS_READ,
    Permission.NOTIFICATIONS_SEND,
  ],

  [UserRole.ADMIN]: [
    ...ALL_PERMISSIONS,
  ],

  [UserRole.OPERATIONS]: [
    Permission.ORDERS_READ,
    Permission.ORDERS_UPDATE,
    Permission.ORDERS_ASSIGN_DRIVER,
    Permission.ORDERS_VIEW_ALL,
    Permission.DRIVERS_READ,
    Permission.DRIVERS_ASSIGN,
    Permission.DRIVERS_VIEW_LOCATION,
    Permission.MERCHANTS_READ,
    Permission.MERCHANTS_VIEW_ORDERS,
    Permission.CUSTOMERS_READ,
    Permission.CHAT_READ,
    Permission.CHAT_SEND,
    Permission.TICKETS_READ,
    Permission.TICKETS_CREATE,
    Permission.TICKETS_UPDATE,
    Permission.NOTIFICATIONS_SEND,
    Permission.ANALYTICS_READ,
  ],

  [UserRole.SUPPORT]: [
    Permission.ORDERS_READ,
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_VIEW_ORDERS,
    Permission.CUSTOMERS_VIEW_COMPLAINTS,
    Permission.DRIVERS_READ,
    Permission.MERCHANTS_READ,
    Permission.CHAT_READ,
    Permission.CHAT_SEND,
    Permission.TICKETS_READ,
    Permission.TICKETS_CREATE,
    Permission.TICKETS_UPDATE,
    Permission.TICKETS_RESOLVE,
    Permission.TICKETS_ASSIGN,
    Permission.NOTIFICATIONS_SEND,
    Permission.WALLETS_READ,
    Permission.PAYMENTS_READ,
  ],

  [UserRole.FINANCE]: [
    Permission.ORDERS_READ,
    Permission.ORDERS_VIEW_ALL,
    Permission.PAYMENTS_READ,
    Permission.PAYMENTS_REFUND,
    Permission.WALLETS_READ,
    Permission.WALLETS_VIEW_TRANSACTIONS,
    Permission.DRIVERS_VIEW_EARNINGS,
    Permission.MERCHANTS_VIEW_REVENUE,
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT,
    Permission.NOTIFICATIONS_SEND,
  ],

  [UserRole.SUPER_ADMIN]: [
    ...ALL_PERMISSIONS,
  ],
};

export function getAllPermissionsForRole(role: UserRole): Permission[] {
  const direct = ROLE_PERMISSIONS[role] || [];
  const inherited = ROLE_HIERARCHY[role]?.flatMap(getAllPermissionsForRole) || [];
  return [...new Set([...direct, ...inherited])];
}

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return getAllPermissionsForRole(role).includes(permission);
}

export function userHasPermission(roles: UserRole[], permission: Permission): boolean {
  return roles.some(role => roleHasPermission(role, permission));
}

export function userHasAnyPermission(roles: UserRole[], permissions: Permission[]): boolean {
  return permissions.some(permission => userHasPermission(roles, permission));
}

export function userHasAllPermissions(roles: UserRole[], permissions: Permission[]): boolean {
  return permissions.every(permission => userHasPermission(roles, permission));
}

export function getUserPermissions(roles: UserRole[]): Permission[] {
  const allPermissions = new Set<Permission>();
  for (const role of roles) {
    for (const permission of getAllPermissionsForRole(role)) {
      allPermissions.add(permission);
    }
  }
  return Array.from(allPermissions);
}

export function filterPermissionsByGroup(permissions: Permission[], group: keyof typeof import('./permissions').PERMISSION_GROUPS): Permission[] {
  const groupPermissions = import('./permissions').PERMISSION_GROUPS[group];
  return permissions.filter(p => groupPermissions.includes(p));
}