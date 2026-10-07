import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthUser, UserRole } from '@delivery/types';
import { Permission } from '@delivery/permissions';
import { storeTokens, getTokens, clearTokens, storeUserData, getUserData, clearAllAuthData, getDeviceId } from './storage/secureStorage';
import { decodeToken, isTokenExpired, buildAuthUser, createAuthUserFromResponse } from './utils/tokenUtils';
import { AUTH_CONFIG } from '@delivery/config';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }, userData?: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  switchRole: (role: UserRole) => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const { accessToken, refreshToken } = await getTokens();
      const userData = await getUserData();

      if (accessToken && refreshToken && userData) {
        if (!isTokenExpired(accessToken)) {
          setUser(userData as AuthUser);
        } else {
          // Try to refresh
          const newAccessToken = await refreshAccessTokenInternal(refreshToken);
          if (newAccessToken) {
            const payload = decodeToken(newAccessToken);
            if (payload) {
              const authUser = buildAuthUser(payload);
              setUser(authUser);
              await storeTokens(newAccessToken, refreshToken);
              await storeUserData(authUser);
            }
          } else {
            await clearAllAuthData();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      await clearAllAuthData();
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessTokenInternal = async (refreshToken: string): Promise<string | null> => {
    try {
      const deviceId = await getDeviceId();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': deviceId,
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.accessToken;
    } catch {
      return null;
    }
  };

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const { refreshToken } = await getTokens();
    if (!refreshToken) return null;

    const newAccessToken = await refreshAccessTokenInternal(refreshToken);
    if (newAccessToken) {
      await storeTokens(newAccessToken, refreshToken);
      const payload = decodeToken(newAccessToken);
      if (payload) {
        const authUser = buildAuthUser(payload);
        setUser(authUser);
        await storeUserData(authUser);
      }
    }
    return newAccessToken;
  }, []);

  const login = async (tokens: { accessToken: string; refreshToken: string }, userData?: AuthUser) => {
    await storeTokens(tokens.accessToken, tokens.refreshToken);
    
    let authUser: AuthUser;
    if (userData) {
      authUser = userData;
    } else {
      const payload = decodeToken(tokens.accessToken);
      if (!payload) throw new Error('Invalid access token');
      authUser = buildAuthUser(payload);
    }
    
    setUser(authUser);
    await storeUserData(authUser);
  };

  const logout = async () => {
    const { refreshToken } = await getTokens();
    if (refreshToken) {
      try {
        const deviceId = await getDeviceId();
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-ID': deviceId,
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Ignore logout API errors
      }
    }
    await clearAllAuthData();
    setUser(null);
  };

  const switchRole = async (role: UserRole) => {
    if (!user || !user.roles.includes(role)) {
      throw new Error('User does not have this role');
    }

    try {
      const { accessToken } = await getTokens();
      const deviceId = await getDeviceId();
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/switch-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Device-ID': deviceId,
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) throw new Error('Failed to switch role');

      const data = await response.json();
      const newAuthUser = data.user as AuthUser;
      setUser(newAuthUser);
      await storeUserData(newAuthUser);
    } catch (error) {
      console.error('Role switch failed:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<AuthUser>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    await storeUserData(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAccessToken,
    switchRole,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useUserRole(): UserRole | null {
  const { user } = useAuth();
  return user?.primaryRole || null;
}