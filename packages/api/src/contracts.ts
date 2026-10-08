import { z } from 'zod';

// API Response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.unknown()).optional(),
      statusCode: z.number(),
    }).optional(),
    meta: z.object({
      timestamp: z.string(),
      requestId: z.string().optional(),
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      }).optional(),
      rateLimit: z.object({
        limit: z.number(),
        remaining: z.number(),
        reset: z.number(),
      }).optional(),
    }).optional(),
  });

// Pagination
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const CursorPaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Auth endpoints
export const SendOtpRequestSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/),
  method: z.enum(['SMS', 'WHATSAPP']).optional(),
});

export const SendOtpResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  expiresIn: z.number(),
});

export const VerifyOtpRequestSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/),
  otp: z.string().regex(/^\d{6}$/),
  deviceInfo: z.object({
    deviceId: z.string().uuid(),
    platform: z.enum(['ios', 'android']),
    appVersion: z.string(),
    pushToken: z.string().optional(),
  }).optional(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  deviceInfo: z.object({
    deviceId: z.string().uuid(),
    platform: z.enum(['ios', 'android']),
    appVersion: z.string(),
    pushToken: z.string().optional(),
  }).optional(),
});

export const RefreshRequestSchema = z.object({
  refreshToken: z.string(),
});

export const LogoutRequestSchema = z.object({
  refreshToken: z.string(),
});

export const SwitchRoleRequestSchema = z.object({
  role: z.enum([
    'CUSTOMER', 'DRIVER', 'MERCHANT', 'ADMIN', 
    'OPERATIONS', 'SUPPORT', 'FINANCE', 'SUPER_ADMIN'
  ]),
});

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  phone: z.string(),
  email: z.string().optional(),
  name: z.string(),
  roles: z.array(z.enum([
    'CUSTOMER', 'DRIVER', 'MERCHANT', 'ADMIN', 
    'OPERATIONS', 'SUPPORT', 'FINANCE', 'SUPER_ADMIN'
  ])),
  primaryRole: z.enum([
    'CUSTOMER', 'DRIVER', 'MERCHANT', 'ADMIN', 
    'OPERATIONS', 'SUPPORT', 'FINANCE', 'SUPER_ADMIN'
  ]),
  permissions: z.array(z.string()),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DELETED']),
});

export const VerifyOtpResponseSchema = z.object({
  success: z.boolean(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: AuthUserSchema,
  isNewUser: z.boolean(),
});

export const LoginResponseSchema = VerifyOtpResponseSchema;

export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const MeResponseSchema = z.object({
  user: AuthUserSchema,
});

export const SwitchRoleResponseSchema = z.object({
  user: AuthUserSchema,
  navigationReset: z.boolean(),
});

// Order endpoints
export const CreateOrderRequestSchema = z.object({
  merchantId: z.string().uuid(),
  addressId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    notes: z.string().optional(),
    modifiers: z.array(z.object({
      modifierId: z.string().uuid(),
      optionId: z.string().uuid(),
    })),
  })).min(1),
  paymentMethodId: z.string().uuid().optional(),
  promoCode: z.string().optional(),
  tipUsd: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const UpdateOrderStatusRequestSchema = z.object({
  status: z.enum([
    'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DRIVER_ASSIGNED',
    'PICKED_UP', 'ON_THE_WAY', 'ARRIVED', 'DELIVERED', 'CANCELLED',
    'REFUNDED', 'FAILED', 'DISPUTED'
  ]),
  metadata: z.record(z.unknown()).optional(),
  cancellationReason: z.string().optional(),
  disputeReason: z.string().optional(),
});

export const AssignDriverRequestSchema = z.object({
  driverId: z.string().uuid(),
});

export const RefundRequestSchema = z.object({
  amountUsd: z.number().nonnegative().optional(),
  amountLbp: z.number().nonnegative().optional(),
  reason: z.string().min(1),
  type: z.enum(['FULL', 'PARTIAL']),
});

export const OrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum([
    'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DRIVER_ASSIGNED',
    'PICKED_UP', 'ON_THE_WAY', 'ARRIVED', 'DELIVERED', 'CANCELLED',
    'REFUNDED', 'FAILED', 'DISPUTED'
  ]).optional(),
  customerId: z.string().uuid().optional(),
  merchantId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

// Common types
export type SendOtpRequest = z.infer<typeof SendOtpRequestSchema>;
export type SendOtpResponse = z.infer<typeof SendOtpResponseSchema>;
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type SwitchRoleRequest = z.infer<typeof SwitchRoleRequestSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type VerifyOtpResponse = z.infer<typeof VerifyOtpResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
export type SwitchRoleResponse = z.infer<typeof SwitchRoleResponseSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusRequestSchema>;
export type AssignDriverRequest = z.infer<typeof AssignDriverRequestSchema>;
export type RefundRequest = z.infer<typeof RefundRequestSchema>;
export type OrderQuery = z.infer<typeof OrderQuerySchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;