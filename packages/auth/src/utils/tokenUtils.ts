import { AuthUser, UserRole } from '@delivery/types';
import { Permission, getUserPermissions } from '@delivery/permissions';

export interface TokenPayload {
  sub: string;
  phone: string;
  email?: string;
  name: string;
  roles: UserRole[];
  primaryRole: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
  deviceId?: string;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
}

export function getTokenExpiry(token: string): Date | null {
  const payload = decodeToken(token);
  if (!payload) return null;
  return new Date(payload.exp * 1000);
}

export function buildAuthUser(payload: TokenPayload): AuthUser {
  return {
    id: payload.sub,
    phone: payload.phone,
    email: payload.email,
    name: payload.name,
    roles: payload.roles,
    primaryRole: payload.primaryRole,
    permissions: payload.permissions,
    status: 'ACTIVE',
  };
}

export function createAuthUserFromResponse(data: {
  user: {
    id: string;
    phone: string;
    email?: string;
    name: string;
    roles: UserRole[];
    primaryRole: UserRole;
    status: string;
  };
  accessToken: string;
}): AuthUser {
  const payload = decodeToken(data.accessToken);
  if (!payload) {
    throw new Error('Invalid access token');
  }
  return buildAuthUser(payload);
}