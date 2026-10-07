# User, Role & Permission Architecture

## Role Definitions

```typescript
// packages/types/src/roles.ts

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
  OPERATIONS = 'OPERATIONS',
  SUPPORT = 'SUPPORT',
  FINANCE = 'FINANCE',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Role hierarchy (for inheritance)
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.FINANCE, UserRole.SUPPORT],
  [UserRole.ADMIN]: [UserRole.OPERATIONS, UserRole.FINANCE, UserRole.SUPPORT],
  [UserRole.OPERATIONS]: [],
  [UserRole.FINANCE]: [],
  [UserRole.SUPPORT]: [],
  [UserRole.MERCHANT]: [],
  [UserRole.DRIVER]: [],
  [UserRole.CUSTOMER]: [],
};

// Default role for new users
export const DEFAULT_ROLE = UserRole.CUSTOMER;

// Roles that can access admin panel
export const ADMIN_PANEL_ROLES = [
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.OPERATIONS,
  UserRole.FINANCE,
  UserRole.SUPPORT,
];

// Roles that have driver-specific features
export const DRIVER_ROLES = [UserRole.DRIVER];

// Roles that have merchant-specific features
export const MERCHANT_ROLES = [UserRole.MERCHANT];
```

## Permission System

```typescript
// packages/permissions/src/permissions.ts

export enum Permission {
  // Orders
  ORDERS_READ = 'orders.read',
  ORDERS_CREATE = 'orders.create',
  ORDERS_UPDATE = 'orders.update',
  ORDERS_CANCEL = 'orders.cancel',
  ORDERS_ASSIGN_DRIVER = 'orders.assign_driver',
  ORDERS_VIEW_ALL = 'orders.view_all',
  ORDERS_REFUND = 'orders.refund',

  // Drivers
  DRIVERS_READ = 'drivers.read',
  DRIVERS_CREATE = 'drivers.create',
  DRIVERS_UPDATE = 'drivers.update',
  DRIVERS_SUSPEND = 'drivers.suspend',
  DRIVERS_APPROVE = 'drivers.approve',
  DRIVERS_ASSIGN = 'drivers.assign',
  DRIVERS_VIEW_EARNINGS = 'drivers.view_earnings',
  DRIVERS_VIEW_LOCATION = 'drivers.view_location',
  DRIVERS_VIEW_DOCUMENTS = 'drivers.view_documents',

  // Merchants
  MERCHANTS_READ = 'merchants.read',
  MERCHANTS_CREATE = 'merchants.create',
  MERCHANTS_UPDATE = 'merchants.update',
  MERCHANTS_SUSPEND = 'merchants.suspend',
  MERCHANTS_APPROVE = 'merchants.approve',
  MERCHANTS_VIEW_ORDERS = 'merchants.view_orders',
  MERCHANTS_VIEW_REVENUE = 'merchants.view_revenue',
  MERCHANTS_CONFIGURE_COMMISSION = 'merchants.configure_commission',

  // Customers
  CUSTOMERS_READ = 'customers.read',
  CUSTOMERS_CREATE = 'customers.create',
  CUSTOMERS_UPDATE = 'customers.update',
  CUSTOMERS_SUSPEND = 'customers.suspend',
  CUSTOMERS_VIEW_ORDERS = 'customers.view_orders',
  CUSTOMERS_VIEW_WALLET = 'customers.view_wallet',
  CUSTOMERS_VIEW_COMPLAINTS = 'customers.view_complaints',

  // Payments
  PAYMENTS_READ = 'payments.read',
  PAYMENTS_REFUND = 'payments.refund',
  PAYMENTS_PROCESS = 'payments.process',

  // Wallets
  WALLETS_READ = 'wallets.read',
  WALLETS_CREDIT = 'wallets.credit',
  WALLETS_DEBIT = 'wallets.debit',
  WALLETS_VIEW_TRANSACTIONS = 'wallets.view_transactions',

  // Analytics
  ANALYTICS_READ = 'analytics.read',
  ANALYTICS_EXPORT = 'analytics.export',

  // Settings
  SETTINGS_READ = 'settings.read',
  SETTINGS_UPDATE = 'settings.update',
  SETTINGS_MANAGE_ZONES = 'settings.manage_zones',
  SETTINGS_MANAGE_PROMOS = 'settings.manage_promos',
  SETTINGS_MANAGE_FEES = 'settings.manage_fees',

  // Support
  TICKETS_READ = 'tickets.read',
  TICKETS_CREATE = 'tickets.create',
  TICKETS_UPDATE = 'tickets.update',
  TICKETS_RESOLVE = 'tickets.resolve',
  TICKETS_ASSIGN = 'tickets.assign',

  // Chat
  CHAT_READ = 'chat.read',
  CHAT_SEND = 'chat.send',

  // Notifications
  NOTIFICATIONS_SEND = 'notifications.send',
  NOTIFICATIONS_BROADCAST = 'notifications.broadcast',
}

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  orders: [
    Permission.ORDERS_READ,
    Permission.ORDERS_CREATE,
    Permission.ORDERS_UPDATE,
    Permission.ORDERS_CANCEL,
    Permission.ORDERS_ASSIGN_DRIVER,
    Permission.ORDERS_VIEW_ALL,
    Permission.ORDERS_REFUND,
  ],
  drivers: [
    Permission.DRIVERS_READ,
    Permission.DRIVERS_CREATE,
    Permission.DRIVERS_UPDATE,
    Permission.DRIVERS_SUSPEND,
    Permission.DRIVERS_APPROVE,
    Permission.DRIVERS_ASSIGN,
    Permission.DRIVERS_VIEW_EARNINGS,
    Permission.DRIVERS_VIEW_LOCATION,
    Permission.DRIVERS_VIEW_DOCUMENTS,
  ],
  merchants: [
    Permission.MERCHANTS_READ,
    Permission.MERCHANTS_CREATE,
    Permission.MERCHANTS_UPDATE,
    Permission.MERCHANTS_SUSPEND,
    Permission.MERCHANTS_APPROVE,
    Permission.MERCHANTS_VIEW_ORDERS,
    Permission.MERCHANTS_VIEW_REVENUE,
    Permission.MERCHANTS_CONFIGURE_COMMISSION,
  ],
  customers: [
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_CREATE,
    Permission.CUSTOMERS_UPDATE,
    Permission.CUSTOMERS_SUSPEND,
    Permission.CUSTOMERS_VIEW_ORDERS,
    Permission.CUSTOMERS_VIEW_WALLET,
    Permission.CUSTOMERS_VIEW_COMPLAINTS,
  ],
  payments: [
    Permission.PAYMENTS_READ,
    Permission.PAYMENTS_REFUND,
    Permission.PAYMENTS_PROCESS,
  ],
  wallets: [
    Permission.WALLETS_READ,
    Permission.WALLETS_CREDIT,
    Permission.WALLETS_DEBIT,
    Permission.WALLETS_VIEW_TRANSACTIONS,
  ],
  analytics: [
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT,
  ],
  settings: [
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,
    Permission.SETTINGS_MANAGE_ZONES,
    Permission.SETTINGS_MANAGE_PROMOS,
    Permission.SETTINGS_MANAGE_FEES,
  ],
  support: [
    Permission.TICKETS_READ,
    Permission.TICKETS_CREATE,
    Permission.TICKETS_UPDATE,
    Permission.TICKETS_RESOLVE,
    Permission.TICKETS_ASSIGN,
  ],
  chat: [
    Permission.CHAT_READ,
    Permission.CHAT_SEND,
  ],
  notifications: [
    Permission.NOTIFICATIONS_SEND,
    Permission.NOTIFICATIONS_BROADCAST,
  ],
} as const;

// Role -> Permissions mapping (default permissions per role)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CUSTOMER]: [
    Permission.ORDERS_CREATE,
    Permission.ORDERS_READ, // own orders only
    Permission.CHAT_READ,
    Permission.CHAT_SEND,
    Permission.WALLETS_READ, // own wallet only
    Permission.NOTIFICATIONS_SEND, // to self
  ],

  [UserRole.DRIVER]: [
    Permission.ORDERS_READ, // assigned orders only
    Permission.ORDERS_UPDATE, // status updates for assigned orders
    Permission.DRIVERS_READ, // own profile
    Permission.DRIVERS_UPDATE, // own profile
    Permission.DRIVERS_VIEW_EARNINGS, // own earnings
    Permission.DRIVERS_VIEW_LOCATION, // own location
    Permission.CHAT_READ,
    Permission.CHAT_SEND,
    Permission.WALLETS_READ, // own wallet
    Permission.NOTIFICATIONS_SEND, // to self
  ],

  [UserRole.MERCHANT]: [
    Permission.ORDERS_READ, // own merchant orders
    Permission.ORDERS_UPDATE, // accept/reject/ready
    Permission.MERCHANTS_READ, // own profile
    Permission.MERCHANTS_UPDATE, // own profile
    Permission.MERCHANTS_VIEW_ORDERS,
    Permission.MERCHANTS_VIEW_REVENUE,
    Permission.CHAT_READ,
    Permission.CHAT_SEND,
    Permission.WALLETS_READ, // own wallet
    Permission.NOTIFICATIONS_SEND, // to self
  ],

  [UserRole.ADMIN]: [
    // Full access to all permissions
    ...Object.values(Permission),
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
    ...Object.values(Permission),
  ],
};

// Helper to get all permissions including inherited
export function getAllPermissionsForRole(role: UserRole): Permission[] {
  const direct = ROLE_PERMISSIONS[role] || [];
  const inherited = ROLE_HIERARCHY[role]?.flatMap(getAllPermissionsForRole) || [];
  return [...new Set([...direct, ...inherited])];
}

// Check if role has permission
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return getAllPermissionsForRole(role).includes(permission);
}

// Check if user (with roles array) has permission
export function userHasPermission(roles: UserRole[], permission: Permission): boolean {
  return roles.some(role => roleHasPermission(role, permission));
}
```

## User Model with Multiple Roles Support

```typescript
// packages/types/src/user.ts

import { UserRole } from './roles';
import { Permission } from '../permissions/permissions';

export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  avatar?: string;
  roles: UserRole[];  // Multiple roles support
  primaryRole: UserRole;  // Current active role
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  DELETED = 'DELETED',
}

// Role-specific profile data (joined from separate tables)
export interface CustomerProfile {
  userId: string;
  walletId: string;
  loyaltyPoints: number;
  defaultAddressId?: string;
  favoriteMerchantIds: string[];
  preferredLanguage: 'ar' | 'en';
  marketingOptIn: boolean;
}

export interface DriverProfile {
  userId: string;
  status: DriverStatus;
  onlineStatus: OnlineStatus;
  vehicleId?: string;
  rating: number;
  totalDeliveries: number;
  currentLatitude?: number;
  currentLongitude?: number;
  lastLocationUpdate?: Date;
  documentsVerified: boolean;
  backgroundCheckStatus: BackgroundCheckStatus;
}

export interface MerchantProfile {
  userId: string;
  businessName: string;
  businessNameAr: string;
  logo?: string;
  cover?: string;
  address: string;
  latitude: number;
  longitude: number;
  status: MerchantStatus;
  commissionRate: number;
  openingHours: OpeningHours;
  averagePrepTime: number;
  zoneIds: string[];
  documentsVerified: boolean;
}

export interface AdminProfile {
  userId: string;
  department: string;
  title: string;
  customPermissions: Permission[]; // Additional permissions beyond role
  restrictedToZones?: string[]; // Zone restrictions for ops/support
}

export enum DriverStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

export enum OnlineStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY',
  ON_BREAK = 'ON_BREAK',
}

export enum BackgroundCheckStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum MerchantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string; // HH:mm
  closeTime?: string; // HH:mm
  breaks?: TimeRange[];
}

export interface TimeRange {
  start: string;
  end: string;
}

// Authenticated user context (from JWT)
export interface AuthUser {
  id: string;
  phone: string;
  email?: string;
  name: string;
  roles: UserRole[];
  primaryRole: UserRole;
  permissions: Permission[];
  status: UserStatus;
}

// Switch role request
export interface SwitchRoleRequest {
  role: UserRole;
}

// Switch role response
export interface SwitchRoleResponse {
  user: AuthUser;
  navigationReset: boolean;
}
```

## Backend Authorization Guards

```typescript
// packages/permissions/src/guards.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, userHasPermission } from './permissions';
import { UserRole } from '@delivery/types/roles';

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';
export const RESOURCE_OWNER_KEY = 'resourceOwner';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireRoles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);

export const ResourceOwner = (getResourceOwnerId: (req: any) => string) =>
  SetMetadata(RESOURCE_OWNER_KEY, getResourceOwnerId);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const resourceOwnerFn = this.reflector.getAllAndOverride<
      (req: any) => string
    >(RESOURCE_OWNER_KEY, [context.getHandler(), context.getClass()]);

    const request = context.switchToHttp().getRequest();
    const user = request.user; // AuthUser from JWT

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check role requirement
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = user.roles.some(role => requiredRoles.includes(role));
      if (!hasRole) {
        throw new ForbiddenException('Insufficient role');
      }
    }

    // Check permission requirement
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every(permission =>
        userHasPermission(user.roles, permission)
      );
      if (!hasPermission) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    // Check resource ownership
    if (resourceOwnerFn) {
      const resourceOwnerId = resourceOwnerFn(request);
      if (resourceOwnerId && resourceOwnerId !== user.id) {
        // Allow if user has admin-level permissions
        const canManageOthers = userHasPermission(user.roles, Permission.ORDERS_VIEW_ALL) ||
                                userHasPermission(user.roles, Permission.CUSTOMERS_VIEW_ORDERS) ||
                                userHasPermission(user.roles, Permission.DRIVERS_VIEW_EARNINGS);
        if (!canManageOthers) {
          throw new ForbiddenException('Access denied: not resource owner');
        }
      }
    }

    return true;
  }
}

// Convenience decorators
export const Auth = () => SetMetadata('isPublic', false);
export const Public = () => SetMetadata('isPublic', true);
```

## Frontend Permission Hooks

```typescript
// packages/permissions/src/hooks.ts

import { useAuth } from '@delivery/auth';
import { Permission, userHasPermission } from './permissions';
import { UserRole } from '@delivery/types/roles';

export function usePermissions() {
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
    return user.roles.some(role => roles.includes(role));
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
  };
}

// Component guard
export function PermissionGate({
  permissions,
  roles,
  children,
  fallback = null,
}: {
  permissions?: Permission[];
  roles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission, hasAnyRole } = usePermissions();

  const hasRequiredPermissions = permissions?.every(hasPermission) ?? true;
  const hasRequiredRoles = roles?.some(hasAnyRole) ?? true;

  if (hasRequiredPermissions && hasRequiredRoles) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
```