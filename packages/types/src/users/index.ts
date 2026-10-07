import { z } from 'zod';

export const UserStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'PENDING_VERIFICATION',
  'DELETED',
]);

export type UserStatus = z.infer<typeof UserStatusSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/), // E.164
  email: z.string().email().optional(),
  name: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  roles: z.array(z.nativeEnum(require('./roles').UserRole)).min(1),
  primaryRole: z.nativeEnum(require('./roles').UserRole),
  status: UserStatusSchema,
  emailVerified: z.boolean(),
  phoneVerified: z.boolean(),
  lastLoginAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  phone: z.string(),
  email: z.string().optional(),
  name: z.string(),
  roles: z.array(z.nativeEnum(require('./roles').UserRole)),
  primaryRole: z.nativeEnum(require('./roles').UserRole),
  permissions: z.array(z.string()),
  status: UserStatusSchema,
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const RegisterRequestSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/),
  email: z.string().email().optional(),
  name: z.string().min(1).max(100),
  role: z.nativeEnum(require('./roles').UserRole),
  merchantData: z.object({
    businessName: z.string(),
    businessNameAr: z.string().optional(),
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    zoneId: z.string().uuid(),
  }).optional(),
  driverData: z.object({
    vehicleType: z.enum(['MOTORCYCLE', 'CAR', 'BICYCLE', 'SCOOTER']),
    licenseNumber: z.string(),
    vehiclePlate: z.string(),
  }).optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const SwitchRoleRequestSchema = z.object({
  role: z.nativeEnum(require('./roles').UserRole),
});

export type SwitchRoleRequest = z.infer<typeof SwitchRoleRequestSchema>;

export const SwitchRoleResponseSchema = z.object({
  user: AuthUserSchema,
  navigationReset: z.boolean(),
});

export type SwitchRoleResponse = z.infer<typeof SwitchRoleResponseSchema>;