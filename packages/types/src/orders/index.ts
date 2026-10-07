import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'DRIVER_ASSIGNED',
  'PICKED_UP',
  'ON_THE_WAY',
  'ARRIVED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'FAILED',
  'DISPUTED',
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const DeliveryStatusSchema = z.enum([
  'CREATED',
  'SEARCHING_DRIVER',
  'DRIVER_ASSIGNED',
  'EN_ROUTE_TO_MERCHANT',
  'ARRIVED_AT_MERCHANT',
  'PICKED_UP',
  'EN_ROUTE_TO_CUSTOMER',
  'ARRIVED_AT_CUSTOMER',
  'DELIVERED',
  'FAILED',
  'CANCELLED',
  'RETURNED',
]);

export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  customerId: z.string().uuid(),
  merchantId: z.string().uuid(),
  driverId: z.string().uuid().nullable(),
  addressId: z.string().uuid(),
  paymentId: z.string().uuid().nullable(),
  status: OrderStatusSchema,
  subtotalUsd: z.number().nonnegative(),
  subtotalLbp: z.number().nonnegative(),
  deliveryFeeUsd: z.number().nonnegative(),
  deliveryFeeLbp: z.number().nonnegative(),
  serviceFeeUsd: z.number().nonnegative(),
  serviceFeeLbp: z.number().nonnegative(),
  commissionUsd: z.number().nonnegative(),
  commissionLbp: z.number().nonnegative(),
  tipUsd: z.number().nonnegative().default(0),
  tipLbp: z.number().nonnegative().default(0),
  totalUsd: z.number().nonnegative(),
  totalLbp: z.number().nonnegative(),
  exchangeRate: z.number().positive(),
  promoId: z.string().uuid().nullable(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Order = z.infer<typeof OrderSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPriceUsd: z.number().nonnegative(),
  unitPriceLbp: z.number().nonnegative(),
  totalUsd: z.number().nonnegative(),
  totalLbp: z.number().nonnegative(),
  notes: z.string().optional(),
  modifiers: z.array(z.object({
    modifierId: z.string().uuid(),
    optionId: z.string().uuid(),
    priceUsd: z.number().nonnegative(),
    priceLbp: z.number().nonnegative(),
  })),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderStatusHistorySchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  fromStatus: OrderStatusSchema.nullable(),
  toStatus: OrderStatusSchema,
  changedBy: z.string().uuid(),
  changedByRole: z.nativeEnum(require('../roles').UserRole),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
  disputeReason: z.string().optional(),
  changedAt: z.date(),
});

export type OrderStatusHistory = z.infer<typeof OrderStatusHistorySchema>;

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

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;

export const UpdateOrderStatusRequestSchema = z.object({
  status: OrderStatusSchema,
  metadata: z.record(z.unknown()).optional(),
  cancellationReason: z.string().optional(),
  disputeReason: z.string().optional(),
});

export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusRequestSchema>;

export const AssignDriverRequestSchema = z.object({
  driverId: z.string().uuid(),
});

export type AssignDriverRequest = z.infer<typeof AssignDriverRequestSchema>;

export const RefundRequestSchema = z.object({
  amountUsd: z.number().nonnegative().optional(),
  amountLbp: z.number().nonnegative().optional(),
  reason: z.string().min(1),
  type: z.enum(['FULL', 'PARTIAL']),
});

export type RefundRequest = z.infer<typeof RefundRequestSchema>;