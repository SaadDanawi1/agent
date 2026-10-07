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

export const DEFAULT_ROLE = UserRole.CUSTOMER;

export const ADMIN_PANEL_ROLES = [
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.OPERATIONS,
  UserRole.FINANCE,
  UserRole.SUPPORT,
] as const;

export const DRIVER_ROLES = [UserRole.DRIVER] as const;
export const MERCHANT_ROLES = [UserRole.MERCHANT] as const;

export function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}

export function isAdminRole(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role);
}

export function isOperationsRole(role: UserRole): boolean {
  return [UserRole.OPERATIONS, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role);
}

export function getRoleLabel(role: UserRole, locale: 'en' | 'ar' = 'en'): string {
  const labels: Record<UserRole, { en: string; ar: string }> = {
    [UserRole.CUSTOMER]: { en: 'Customer', ar: 'عميل' },
    [UserRole.DRIVER]: { en: 'Driver', ar: 'سائق' },
    [UserRole.MERCHANT]: { en: 'Merchant', ar: 'تاجر' },
    [UserRole.ADMIN]: { en: 'Admin', ar: 'مسؤول' },
    [UserRole.OPERATIONS]: { en: 'Operations', ar: 'عمليات' },
    [UserRole.SUPPORT]: { en: 'Support', ar: 'دعم' },
    [UserRole.FINANCE]: { en: 'Finance', ar: 'مالية' },
    [UserRole.SUPER_ADMIN]: { en: 'Super Admin', ar: 'مشرف عام' },
  };
  return labels[role]?.[locale] || role;
}