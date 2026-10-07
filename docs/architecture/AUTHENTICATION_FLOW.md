# Authentication Flow Architecture

## Overview
Unified authentication supporting:
- Phone + OTP (primary for Lebanon)
- Email + Password
- Social login (future)
- JWT access + refresh tokens
- Secure token storage

## Auth Flow Diagrams

### Phone + OTP Login

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  User   │     │   Mobile    │     │   Backend   │     │   Redis/DB  │
└────┬────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
     │                 │                   │                   │
     │ 1. Enter Phone  │                   │                   │
     │────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │ 2. POST /auth/    │                   │
     │                 │    send-otp       │                   │
     │                 │──────────────────>│                   │
     │                 │                   │                   │
     │                 │                   │ 3. Generate OTP   │
     │                 │                   │    Store in Redis │
     │                 │                   │    (TTL: 5 min)   │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │                   │ 4. Send SMS       │
     │                 │                   │    (Twilio/Provider)│
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │ 5. OTP Sent OK    │                   │
     │                 │<──────────────────│                   │
     │                 │                   │                   │
     │ 6. Show OTP UI  │                   │                   │
     │<────────────────│                   │                   │
     │                 │                   │                   │
     │ 7. Enter OTP    │                   │                   │
     │────────────────>│                   │                   │
     │                 │                   │                   │
     │                 │ 8. POST /auth/    │                   │
     │                 │    verify-otp     │                   │
     │                 │──────────────────>│                   │
     │                 │                   │                   │
     │                 │                   │ 9. Verify OTP     │
     │                 │                   │    Match + Delete │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │ 10. Create/Get    │                   │
     │                 │     User Record   │                   │
     │                 │                   │──────────────────>│
     │                 │                   │                   │
     │                 │ 11. Generate      │                   │
     │                 │     JWT Tokens    │                   │
     │                 │                   │                   │
     │ 12. Tokens +    │                   │                   │
     │     User Data   │<──────────────────│                   │
     │<────────────────│                   │                   │
     │                 │                   │                   │
     │ 13. Store tokens│                   │                   │
     │     Securely    │                   │                   │
     │                 │                   │                   │
     │ 14. GET /auth/me│                   │                   │
     │────────────────>│                   │                   │
     │                 │                   │                   │
     │ 15. User Profile│                   │                   │
     │<────────────────│                   │                   │
     │                 │                   │                   │
     │ 16. Route to    │                   │                   │
     │     Role UI     │                   │                   │
```

### Email + Password Login

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐
│  User   │     │   Mobile    │     │   Backend   │
└────┬────┘     └──────┬──────┘     └──────┬──────┘
     │                 │                   │
     │ 1. Enter Email  │                   │
     │    + Password   │                   │
     │────────────────>│                   │
     │                 │                   │
     │                 │ 2. POST /auth/    │
     │                 │    login          │
     │                 │──────────────────>│
     │                 │                   │
     │                 │                   │ 3. Find User
     │                 │                   │    Verify Password
     │                 │                   │    (bcrypt/argon2)
     │                 │                   │                   │
     │                 │ 4. Generate       │                   │
     │                 │    JWT Tokens     │                   │
     │                 │                   │                   │
     │ 5. Tokens +     │                   │                   │
     │    User Data    │<──────────────────│                   │
     │<────────────────│                   │                   │
```

### Token Refresh Flow

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐
│  Mobile │     │   Backend   │     │   Database  │
└────┬────┘     └──────┬──────┘     └──────┬──────┘
     │                 │                   │
     │ 1. API Call     │                   │
     │    (401 Expired)│                   │
     │<────────────────│                   │
     │                 │                   │
     │ 2. POST /auth/  │                   │
     │    refresh      │                   │
     │    (refresh_tkn)│                   │
     │────────────────>│                   │
     │                 │                   │
     │                 │ 3. Validate       │
     │                 │    Refresh Token  │
     │                 │    Check Revoked  │
     │                 │──────────────────>│
     │                 │                   │
     │                 │ 4. Rotate Tokens  │
     │                 │    (New Access +  │
     │                 │     New Refresh)  │
     │                 │                   │
     │ 5. New Tokens   │<──────────────────│
     │<────────────────│                   │
     │                 │                   │
     │ 6. Retry API    │                   │
     │    Call         │                   │
```

## API Endpoints

```typescript
// packages/api/src/auth.ts

// POST /api/auth/send-otp
interface SendOtpRequest {
  phone: string; // E.164 format: +961XXXXXXXXX
  method?: 'SMS' | 'WHATSAPP'; // Default: SMS
}

interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn: number; // seconds
  // Dev only: otp: string (when NODE_ENV !== 'production')
}

// POST /api/auth/verify-otp
interface VerifyOtpRequest {
  phone: string;
  otp: string; // 6 digits
  deviceInfo?: {
    deviceId: string;
    platform: 'ios' | 'android';
    appVersion: string;
    pushToken?: string;
  };
}

interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // access token TTL
  user: AuthUser;
  isNewUser: boolean;
}

// POST /api/auth/login (email + password)
interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// GET /api/auth/me
interface MeResponse {
  user: AuthUser;
}

// POST /api/auth/logout
interface LogoutRequest {
  refreshToken: string; // To revoke
}

interface LogoutResponse {
  success: boolean;
}

// POST /api/auth/switch-role
interface SwitchRoleRequest {
  role: UserRole;
}

interface SwitchRoleResponse {
  user: AuthUser;
  navigationReset: boolean;
}

// POST /api/auth/register (merchant/driver onboarding)
interface RegisterRequest {
  phone: string;
  email?: string;
  name: string;
  role: UserRole; // MERCHANT or DRIVER
  // Role-specific data
  merchantData?: MerchantRegistrationData;
  driverData?: DriverRegistrationData;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
  // OTP will be sent to phone
}
```

## Token Structure

### Access Token (JWT)
```typescript
interface AccessTokenPayload {
  sub: string; // user id
  phone: string;
  email?: string;
  name: string;
  roles: UserRole[];
  primaryRole: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number; // 15-30 minutes
  type: 'access';
  deviceId?: string;
}
```

### Refresh Token (JWT)
```typescript
interface RefreshTokenPayload {
  sub: string; // user id
  tokenId: string; // unique token identifier (for revocation)
  iat: number;
  exp: number; // 30 days
  type: 'refresh';
  deviceId?: string;
}
```

## Security Measures

### OTP Protection
- Rate limiting: 3 requests per phone per hour
- OTP length: 6 digits
- TTL: 5 minutes
- Max attempts: 3 per OTP
- Auto-delete after verification
- Brute force detection (lock phone for 15 min after 5 failed)

### Password Security
- Argon2id hashing (memory-hard)
- Minimum 8 characters
- Breach detection (HaveIBeenPwned API)
- Rate limiting: 5 attempts per 15 min per IP

### Token Security
- Access token: 15 min TTL
- Refresh token: 30 days TTL, rotated on use
- Token revocation on logout, password change, security events
- Secure storage: Keychain (iOS) / Keystore (Android)
- Token binding to device (deviceId in payload)

### Session Management
- Max concurrent sessions: 3 (configurable)
- Session list visible to user
- Remote logout capability
- Automatic cleanup of expired refresh tokens

## Device Registration

```typescript
interface DeviceInfo {
  deviceId: string; // UUID, generated once per install
  platform: 'ios' | 'android';
  appVersion: string;
  osVersion: string;
  pushToken?: string; // FCM/APNs token
  model?: string;
  manufacturer?: string;
}
```

## Lebanon-Specific Config

```typescript
// packages/config/src/lebanon.ts

export const LEBANON_AUTH_CONFIG = {
  phonePrefix: '+961',
  phoneRegex: /^\+961[0-9]{8}$/,
  otpLength: 6,
  otpTtlMinutes: 5,
  maxOtpAttempts: 3,
  otpRateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
  passwordMinLength: 8,
  loginRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  sessionLimit: 3,
  refreshTokenTtlDays: 30,
  accessTokenTtlMinutes: 15,
};

// SMS Providers for Lebanon
export const SMS_PROVIDERS = {
  primary: 'twilio', // or local provider like MTS, Touch
  fallback: 'vonage',
  // Local Lebanese providers:
  // - MTS (Alfa)
  // - Touch
  // - SMS Gateway APIs
};
```

## Mobile Secure Storage

```typescript
// packages/auth/src/storage.ts

import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

const SERVICE = 'delivery-app';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

export async function storeTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await Promise.all([
    Keychain.setGenericPassword(ACCESS_TOKEN_KEY, accessToken, {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
    Keychain.setGenericPassword(REFRESH_TOKEN_KEY, refreshToken, {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
  ]);
}

export async function getTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const [accessCreds, refreshCreds] = await Promise.all([
    Keychain.getGenericPassword({ service: SERVICE, username: ACCESS_TOKEN_KEY }),
    Keychain.getGenericPassword({ service: SERVICE, username: REFRESH_TOKEN_KEY }),
  ]);

  return {
    accessToken: accessCreds?.password || null,
    refreshToken: refreshCreds?.password || null,
  };
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    Keychain.resetGenericPassword({ service: SERVICE, username: ACCESS_TOKEN_KEY }),
    Keychain.resetGenericPassword({ service: SERVICE, username: REFRESH_TOKEN_KEY }),
  ]);
}

export async function storeUserData(userData: object): Promise<void> {
  await Keychain.setGenericPassword(USER_DATA_KEY, JSON.stringify(userData), {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getUserData(): Promise<object | null> {
  const creds = await Keychain.getGenericPassword({ service: SERVICE, username: USER_DATA_KEY });
  if (!creds) return null;
  try {
    return JSON.parse(creds.password);
  } catch {
    return null;
  }
}
```

## Backend Auth Module Structure

```
apps/backend/src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── jwt/
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   ├── jwt.refresh.strategy.ts
│   └── token.service.ts
├── otp/
│   ├── otp.service.ts
│   ├── otp.guard.ts
│   └── sms.provider.ts
├── password/
│   ├── password.service.ts
│   └── password.validator.ts
├── session/
│   ├── session.service.ts
│   └── session.repository.ts
├── guards/
│   ├── permissions.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── current-user.decorator.ts
│   ├── permissions.decorator.ts
│   └── roles.decorator.ts
├── dto/
│   ├── send-otp.dto.ts
│   ├── verify-otp.dto.ts
│   ├── login.dto.ts
│   ├── refresh.dto.ts
│   └── switch-role.dto.ts
└── interfaces/
    ├── auth-user.interface.ts
    └── token-payload.interface.ts
```