# Order State Machine Architecture

## Order Status Enum

```typescript
// packages/order-state-machine/src/statuses.ts

export enum OrderStatus {
  // Initial states
  PENDING = 'PENDING',           // Order placed, awaiting merchant acceptance
  ACCEPTED = 'ACCEPTED',         // Merchant accepted, preparing
  
  // Preparation states
  PREPARING = 'PREPARING',       // Merchant actively preparing
  READY = 'READY',               // Ready for driver pickup
  
  // Dispatch states
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',  // Driver accepted, en route to merchant
  PICKED_UP = 'PICKED_UP',       // Driver picked up from merchant
  
  // Delivery states
  ON_THE_WAY = 'ON_THE_WAY',     // Driver en route to customer
  ARRIVED = 'ARRIVED',           // Driver at customer location
  DELIVERED = 'DELIVERED',       // Order delivered successfully
  
  // Terminal states
  CANCELLED = 'CANCELLED',       // Cancelled (by customer/merchant/admin)
  REFUNDED = 'REFUNDED',         // Refunded after delivery/payment
  
  // Special states
  FAILED = 'FAILED',             // Payment failed, order not processed
  DISPUTED = 'DISPUTED',         // Customer dispute raised
}

// Status display labels (i18n keys)
export const ORDER_STATUS_LABELS: Record<OrderStatus, { en: string; ar: string }> = {
  [OrderStatus.PENDING]: { en: 'Order Placed', ar: 'تم تقديم الطلب' },
  [OrderStatus.ACCEPTED]: { en: 'Accepted', ar: 'تم القبول' },
  [OrderStatus.PREPARING]: { en: 'Preparing', ar: 'قيد التحضير' },
  [OrderStatus.READY]: { en: 'Ready for Pickup', ar: 'جاهز للاستلام' },
  [OrderStatus.DRIVER_ASSIGNED]: { en: 'Driver Assigned', ar: 'تم تعيين سائق' },
  [OrderStatus.PICKED_UP]: { en: 'Picked Up', ar: 'تم الاستلام' },
  [OrderStatus.ON_THE_WAY]: { en: 'On the Way', ar: 'في الطريق' },
  [OrderStatus.ARRIVED]: { en: 'Arrived', ar: 'وصل السائق' },
  [OrderStatus.DELIVERED]: { en: 'Delivered', ar: 'تم التسليم' },
  [OrderStatus.CANCELLED]: { en: 'Cancelled', ar: 'ملغي' },
  [OrderStatus.REFUNDED]: { en: 'Refunded', ar: 'مسترد' },
  [OrderStatus.FAILED]: { en: 'Payment Failed', ar: 'فشل الدفع' },
  [OrderStatus.DISPUTED]: { en: 'Disputed', ar: 'مثير للخلاف' },
};

// Status groups for UI/UX
export const ORDER_STATUS_GROUPS = {
  active: [
    OrderStatus.PENDING,
    OrderStatus.ACCEPTED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.DRIVER_ASSIGNED,
    OrderStatus.PICKED_UP,
    OrderStatus.ON_THE_WAY,
    OrderStatus.ARRIVED,
  ],
  completed: [OrderStatus.DELIVERED],
  cancelled: [OrderStatus.CANCELLED, OrderStatus.FAILED],
  refunded: [OrderStatus.REFUNDED],
  disputed: [OrderStatus.DISPUTED],
  terminal: [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.FAILED],
} as const;

// Customer-facing status progression (simplified)
export const CUSTOMER_STATUS_FLOW = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DRIVER_ASSIGNED,
  OrderStatus.PICKED_UP,
  OrderStatus.ON_THE_WAY,
  OrderStatus.ARRIVED,
  OrderStatus.DELIVERED,
];

// Driver-facing status progression
export const DRIVER_STATUS_FLOW = [
  OrderStatus.DRIVER_ASSIGNED,
  OrderStatus.PICKED_UP,
  OrderStatus.ON_THE_WAY,
  OrderStatus.ARRIVED,
  OrderStatus.DELIVERED,
];

// Merchant-facing status progression
export const MERCHANT_STATUS_FLOW = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
];
```

## Valid Transitions

```typescript
// packages/order-state-machine/src/transitions.ts

import { OrderStatus } from './statuses';
import { UserRole } from '@delivery/types/roles';

export interface TransitionRule {
  from: OrderStatus;
  to: OrderStatus;
  allowedRoles: UserRole[];
  requiresActionBy?: UserRole; // Who must perform the action
  conditions?: TransitionCondition[];
  sideEffects?: TransitionSideEffect[];
}

export type TransitionCondition = 
  | 'payment_confirmed'
  | 'merchant_open'
  | 'driver_online'
  | 'driver_nearby'
  | 'customer_available'
  | 'items_available';

export type TransitionSideEffect = 
  | 'notify_customer'
  | 'notify_merchant'
  | 'notify_driver'
  | 'notify_operations'
  | 'assign_driver'
  | 'start_tracking'
  | 'stop_tracking'
  | 'process_payment'
  | 'initiate_refund'
  | 'update_earnings'
  | 'update_merchant_revenue'
  | 'create_delivery_record'
  | 'send_receipt'
  | 'release_driver';

// Transition matrix: from -> allowed next statuses with rules
export const TRANSITION_RULES: TransitionRule[] = [
  // Customer places order
  {
    from: null as any, // Initial creation
    to: OrderStatus.PENDING,
    allowedRoles: [UserRole.CUSTOMER],
    conditions: ['payment_confirmed', 'merchant_open', 'items_available'],
    sideEffects: ['notify_merchant', 'create_delivery_record'],
  },

  // Merchant actions
  {
    from: OrderStatus.PENDING,
    to: OrderStatus.ACCEPTED,
    allowedRoles: [UserRole.MERCHANT, UserRole.ADMIN, UserRole.OPERATIONS],
    requiresActionBy: UserRole.MERCHANT,
    conditions: ['merchant_open'],
    sideEffects: ['notify_customer', 'notify_operations'],
  },
  {
    from: OrderStatus.PENDING,
    to: OrderStatus.CANCELLED,
    allowedRoles: [UserRole.MERCHANT, UserRole.ADMIN, UserRole.OPERATIONS, UserRole.SUPPORT],
    sideEffects: ['notify_customer', 'initiate_refund'],
  },

  {
    from: OrderStatus.ACCEPTED,
    to: OrderStatus.PREPARING,
    allowedRoles: [UserRole.MERCHANT],
    requiresActionBy: UserRole.MERCHANT,
    sideEffects: ['notify_customer'],
  },
  {
    from: OrderStatus.ACCEPTED,
    to: OrderStatus.CANCELLED,
    allowedRoles: [UserRole.MERCHANT, UserRole.ADMIN, UserRole.OPERATIONS],
    sideEffects: ['notify_customer', 'initiate_refund'],
  },

  {
    from: OrderStatus.PREPARING,
    to: OrderStatus.READY,
    allowedRoles: [UserRole.MERCHANT],
    requiresActionBy: UserRole.MERCHANT,
    sideEffects: ['notify_customer', 'notify_operations', 'assign_driver'],
  },
  {
    from: OrderStatus.PREPARING,
    to: OrderStatus.CANCELLED,
    allowedRoles: [UserRole.MERCHANT, UserRole.ADMIN, UserRole.OPERATIONS],
    sideEffects: ['notify_customer', 'initiate_refund'],
  },

  // Driver assignment (system or operations)
  {
    from: OrderStatus.READY,
    to: OrderStatus.DRIVER_ASSIGNED,
    allowedRoles: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.SYSTEM],
    conditions: ['driver_online', 'driver_nearby'],
    sideEffects: ['notify_driver', 'notify_customer', 'start_tracking'],
  },
  {
    from: OrderStatus.READY,
    to: OrderStatus.CANCELLED,
    allowedRoles: [UserRole.ADMIN, UserRole.OPERATIONS],
    sideEffects: ['notify_customer', 'initiate_refund'],
  },

  // Driver actions
  {
    from: OrderStatus.DRIVER_ASSIGNED,
    to: OrderStatus.PICKED_UP,
    allowedRoles: [UserRole.DRIVER],
    requiresActionBy: UserRole.DRIVER,
    conditions: ['driver_nearby'],
    sideEffects: ['notify_customer', 'notify_merchant'],
  },
  {
    from: OrderStatus.DRIVER_ASSIGNED,
    to: OrderStatus.CANCELLED,
    allowedRoles: [UserRole.DRIVER, UserRole.ADMIN, UserRole.OPERATIONS],
    sideEffects: ['notify_customer', 'notify_merchant', 'reassign_driver'],
  },

  {
    from: OrderStatus.PICKED_UP,
    to: OrderStatus.ON_THE_WAY,
    allowedRoles: [UserRole.DRIVER, UserRole.SYSTEM],
    // Automatic when driver leaves merchant location
    sideEffects: ['notify_customer'],
  },

  {
    from: OrderStatus.ON_THE_WAY,
    to: OrderStatus.ARRIVED,
    allowedRoles: [UserRole.DRIVER, UserRole.SYSTEM],
    // Automatic when driver reaches customer location
    conditions: ['customer_available'],
    sideEffects: ['notify_customer'],
  },

  {
    from: OrderStatus.ARRIVED,
    to: OrderStatus.DELIVERED,
    allowedRoles: [UserRole.DRIVER],
    requiresActionBy: UserRole.DRIVER,
    sideEffects: ['notify_customer', 'notify_merchant', 'stop_tracking', 'process_payment', 'update_earnings', 'update_merchant_revenue', 'send_receipt'],
  },

  // Cancellation from active states
  {
    from: OrderStatus.DRIVER_ASSIGNED,
    to: OrderStatus.CANCELLED,
    allowedRoles: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.SUPPORT],
    sideEffects: ['notify_customer', 'notify_driver', 'notify_merchant', 'initiate_refund'],
  },
  {
    from: OrderStatus.PICKED_UP,
    to: OrderStatus.CANCELLED,
    allowedRoles: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.SUPPORT],
    sideEffects: ['notify_customer', 'notify_driver', 'notify_merchant', 'initiate_refund'],
  },
  {
    from: OrderStatus.ON_THE_WAY,
    to: OrderStatus.CANCELLED,
    allowedRoles: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.SUPPORT],
    sideEffects: ['notify_customer', 'notify_driver', 'notify_merchant', 'initiate_refund'],
  },

  // Refund after delivery
  {
    from: OrderStatus.DELIVERED,
    to: OrderStatus.REFUNDED,
    allowedRoles: [UserRole.ADMIN, UserRole.FINANCE, UserRole.SUPPORT],
    sideEffects: ['notify_customer', 'initiate_refund', 'update_earnings', 'update_merchant_revenue'],
  },

  // Dispute
  {
    from: OrderStatus.DELIVERED,
    to: OrderStatus.DISPUTED,
    allowedRoles: [UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPPORT],
    sideEffects: ['notify_merchant', 'notify_operations', 'freeze_payment'],
  },
  {
    from: OrderStatus.DISPUTED,
    to: OrderStatus.REFUNDED,
    allowedRoles: [UserRole.ADMIN, UserRole.FINANCE, UserRole.SUPPORT],
    sideEffects: ['notify_customer', 'notify_merchant', 'initiate_refund'],
  },
  {
    from: OrderStatus.DISPUTED,
    to: OrderStatus.DELIVERED,
    allowedRoles: [UserRole.ADMIN, UserRole.SUPPORT],
    sideEffects: ['notify_customer', 'notify_merchant', 'release_payment'],
  },
];

// Build lookup map for fast validation
export const TRANSITION_MAP: Map<OrderStatus, Map<OrderStatus, TransitionRule>> = new Map();

TRANSITION_RULES.forEach(rule => {
  const fromKey = rule.from || 'INITIAL';
  if (!TRANSITION_MAP.has(fromKey)) {
    TRANSITION_MAP.set(fromKey, new Map());
  }
  TRANSITION_MAP.get(fromKey)!.set(rule.to, rule);
});

// Helper to get valid next statuses
export function getValidNextStatuses(currentStatus: OrderStatus, userRole: UserRole): OrderStatus[] {
  const transitions = TRANSITION_MAP.get(currentStatus);
  if (!transitions) return [];

  const valid: OrderStatus[] = [];
  transitions.forEach((rule, toStatus) => {
    if (rule.allowedRoles.includes(userRole) || rule.allowedRoles.includes(UserRole.SYSTEM)) {
      valid.push(toStatus);
    }
  });
  return valid;
}

// Check if transition is valid
export function canTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
  userRole: UserRole,
  context?: Record<string, any>
): { allowed: boolean; rule?: TransitionRule; reason?: string } {
  const transitions = TRANSITION_MAP.get(fromStatus);
  if (!transitions) {
    return { allowed: false, reason: `No transitions defined from ${fromStatus}` };
  }

  const rule = transitions.get(toStatus);
  if (!rule) {
    return { allowed: false, reason: `Transition from ${fromStatus} to ${toStatus} not defined` };
  }

  if (!rule.allowedRoles.includes(userRole) && !rule.allowedRoles.includes(UserRole.SYSTEM)) {
    return { allowed: false, reason: `Role ${userRole} not allowed for this transition` };
  }

  // Check conditions
  if (rule.conditions && context) {
    for (const condition of rule.conditions) {
      if (!checkCondition(condition, context)) {
        return { allowed: false, reason: `Condition not met: ${condition}` };
      }
    }
  }

  return { allowed: true, rule };
}

function checkCondition(condition: TransitionCondition, context: Record<string, any>): boolean {
  switch (condition) {
    case 'payment_confirmed':
      return context.paymentStatus === 'CONFIRMED';
    case 'merchant_open':
      return context.merchantIsOpen === true;
    case 'driver_online':
      return context.driverStatus === 'ONLINE';
    case 'driver_nearby':
      return context.driverDistanceKm !== undefined && context.driverDistanceKm <= 5;
    case 'customer_available':
      return context.customerResponsive === true;
    case 'items_available':
      return context.allItemsAvailable === true;
    default:
      return true;
  }
}
```

## State Machine Service

```typescript
// packages/order-state-machine/src/OrderStateMachine.ts

import { Injectable, Inject } from '@nestjs/common';
import { OrderStatus, TRANSITION_RULES, TransitionRule, canTransition, getValidNextStatuses } from './transitions';
import { UserRole } from '@delivery/types/roles';
import { PrismaService } from '@delivery/database/PrismaService';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface OrderContext {
  orderId: string;
  currentStatus: OrderStatus;
  userId: string;
  userRole: UserRole;
  // Context for conditions
  paymentStatus?: string;
  merchantIsOpen?: boolean;
  driverStatus?: string;
  driverDistanceKm?: number;
  customerResponsive?: boolean;
  allItemsAvailable?: boolean;
  // Additional metadata
  cancellationReason?: string;
  disputeReason?: string;
  metadata?: Record<string, any>;
}

export interface TransitionResult {
  success: boolean;
  newStatus?: OrderStatus;
  previousStatus: OrderStatus;
  error?: string;
  sideEffects?: string[];
}

@Injectable()
export class OrderStateMachine {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async transition(context: OrderContext): Promise<TransitionResult> {
    const { currentStatus, userRole } = context;

    // Validate transition
    const validation = canTransition(currentStatus, context.toStatus!, userRole, context);
    if (!validation.allowed) {
      return {
        success: false,
        previousStatus: currentStatus,
        error: validation.reason,
      };
    }

    const rule = validation.rule!;

    // Execute transition in transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Update order status
      const order = await tx.order.update({
        where: { id: context.orderId },
        data: {
          status: context.toStatus,
          updatedAt: new Date(),
        },
      });

      // 2. Create status history record
      await tx.orderStatusHistory.create({
        data: {
          orderId: context.orderId,
          fromStatus: currentStatus,
          toStatus: context.toStatus!,
          changedBy: context.userId,
          changedByRole: userRole,
          note: context.metadata?.note,
          cancellationReason: context.cancellationReason,
          disputeReason: context.disputeReason,
        },
      });

      // 3. Execute side effects
      const executedEffects: string[] = [];
      if (rule.sideEffects) {
        for (const effect of rule.sideEffects) {
          await this.executeSideEffect(effect, context, tx);
          executedEffects.push(effect);
        }
      }

      // 4. Emit domain event
      this.eventEmitter.emit('order.status.changed', {
        orderId: context.orderId,
        previousStatus: currentStatus,
        newStatus: context.toStatus,
        changedBy: context.userId,
        changedByRole: userRole,
        timestamp: new Date(),
      });

      return {
        success: true,
        newStatus: context.toStatus,
        previousStatus: currentStatus,
        sideEffects: executedEffects,
      };
    });
  }

  private async executeSideEffect(
    effect: string,
    context: OrderContext,
    tx: any
  ): Promise<void> {
    switch (effect) {
      case 'notify_customer':
        await this.sendNotification(context.orderId, 'CUSTOMER', context.toStatus!);
        break;
      case 'notify_merchant':
        await this.sendNotification(context.orderId, 'MERCHANT', context.toStatus!);
        break;
      case 'notify_driver':
        await this.sendNotification(context.orderId, 'DRIVER', context.toStatus!);
        break;
      case 'notify_operations':
        await this.sendNotification(context.orderId, 'OPERATIONS', context.toStatus!);
        break;
      case 'assign_driver':
        await this.triggerDriverAssignment(context.orderId);
        break;
      case 'start_tracking':
        await this.startDeliveryTracking(context.orderId);
        break;
      case 'stop_tracking':
        await this.stopDeliveryTracking(context.orderId);
        break;
      case 'process_payment':
        await this.processOrderPayment(context.orderId);
        break;
      case 'initiate_refund':
        await this.initiateRefund(context.orderId, context.cancellationReason);
        break;
      case 'update_earnings':
        await this.updateDriverEarnings(context.orderId);
        break;
      case 'update_merchant_revenue':
        await this.updateMerchantRevenue(context.orderId);
        break;
      case 'create_delivery_record':
        await this.createDeliveryRecord(context.orderId);
        break;
      case 'send_receipt':
        await this.sendReceipt(context.orderId);
        break;
      case 'reassign_driver':
        await this.triggerReassignment(context.orderId);
        break;
      case 'freeze_payment':
        await this.freezePayment(context.orderId);
        break;
      case 'release_payment':
        await this.releasePayment(context.orderId);
        break;
    }
  }

  // Side effect implementations (stubs)
  private async sendNotification(orderId: string, recipient: string, status: OrderStatus): Promise<void> {
    this.eventEmitter.emit('notification.send', { orderId, recipient, status });
  }

  private async triggerDriverAssignment(orderId: string): Promise<void> {
    this.eventEmitter.emit('dispatch.assign', { orderId });
  }

  private async startDeliveryTracking(orderId: string): Promise<void> {
    this.eventEmitter.emit('tracking.start', { orderId });
  }

  private async stopDeliveryTracking(orderId: string): Promise<void> {
    this.eventEmitter.emit('tracking.stop', { orderId });
  }

  private async processOrderPayment(orderId: string): Promise<void> {
    this.eventEmitter.emit('payment.process', { orderId });
  }

  private async initiateRefund(orderId: string, reason?: string): Promise<void> {
    this.eventEmitter.emit('refund.initiate', { orderId, reason });
  }

  private async updateDriverEarnings(orderId: string): Promise<void> {
    this.eventEmitter.emit('earnings.update', { orderId, type: 'DRIVER' });
  }

  private async updateMerchantRevenue(orderId: string): Promise<void> {
    this.eventEmitter.emit('revenue.update', { orderId, type: 'MERCHANT' });
  }

  private async createDeliveryRecord(orderId: string): Promise<void> {
    this.eventEmitter.emit('delivery.create', { orderId });
  }

  private async sendReceipt(orderId: string): Promise<void> {
    this.eventEmitter.emit('receipt.send', { orderId });
  }

  private async triggerReassignment(orderId: string): Promise<void> {
    this.eventEmitter.emit('dispatch.reassign', { orderId });
  }

  private async freezePayment(orderId: string): Promise<void> {
    this.eventEmitter.emit('payment.freeze', { orderId });
  }

  private async releasePayment(orderId: string): Promise<void> {
    this.eventEmitter.emit('payment.release', { orderId });
  }

  // Query methods
  async getValidTransitions(orderId: string, userRole: UserRole): Promise<OrderStatus[]> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (!order) return [];
    return getValidNextStatuses(order.status, userRole);
  }

  async getStatusHistory(orderId: string) {
    return this.prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { changedAt: 'asc' },
      include: { changedByUser: { select: { name: true, role: true } } },
    });
  }

  // Bulk transition for admin/operations
  async bulkTransition(
    orderIds: string[],
    toStatus: OrderStatus,
    userId: string,
    userRole: UserRole,
    metadata?: Record<string, any>
  ): Promise<TransitionResult[]> {
    const results: TransitionResult[] = [];
    for (const orderId of orderIds) {
      const order = await this.prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        results.push({ success: false, previousStatus: 'UNKNOWN', error: 'Order not found' });
        continue;
      }
      const result = await this.transition({
        orderId,
        currentStatus: order.status,
        toStatus,
        userId,
        userRole,
        metadata,
      });
      results.push(result);
    }
    return results;
  }
}
```

## Delivery State Machine (Separate from Order)

```typescript
// packages/order-state-machine/src/deliveryStatus.ts

export enum DeliveryStatus {
  CREATED = 'CREATED',           // Delivery record created
  SEARCHING_DRIVER = 'SEARCHING_DRIVER',  // Looking for driver
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',    // Driver accepted
  EN_ROUTE_TO_MERCHANT = 'EN_ROUTE_TO_MERCHANT',
  ARRIVED_AT_MERCHANT = 'ARRIVED_AT_MERCHANT',
  PICKED_UP = 'PICKED_UP',
  EN_ROUTE_TO_CUSTOMER = 'EN_ROUTE_TO_CUSTOMER',
  ARRIVED_AT_CUSTOMER = 'ARRIVED_AT_CUSTOMER',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',             // Could not deliver
  CANCELLED = 'CANCELLED',       // Cancelled before pickup
  RETURNED = 'RETURNED',         // Returned to merchant
}

export const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.CREATED]: [DeliveryStatus.SEARCHING_DRIVER, DeliveryStatus.CANCELLED],
  [DeliveryStatus.SEARCHING_DRIVER]: [DeliveryStatus.DRIVER_ASSIGNED, DeliveryStatus.CANCELLED],
  [DeliveryStatus.DRIVER_ASSIGNED]: [DeliveryStatus.EN_ROUTE_TO_MERCHANT, DeliveryStatus.CANCELLED],
  [DeliveryStatus.EN_ROUTE_TO_MERCHANT]: [DeliveryStatus.ARRIVED_AT_MERCHANT, DeliveryStatus.CANCELLED],
  [DeliveryStatus.ARRIVED_AT_MERCHANT]: [DeliveryStatus.PICKED_UP, DeliveryStatus.CANCELLED],
  [DeliveryStatus.PICKED_UP]: [DeliveryStatus.EN_ROUTE_TO_CUSTOMER],
  [DeliveryStatus.EN_ROUTE_TO_CUSTOMER]: [DeliveryStatus.ARRIVED_AT_CUSTOMER],
  [DeliveryStatus.ARRIVED_AT_CUSTOMER]: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED, DeliveryStatus.RETURNED],
  [DeliveryStatus.DELIVERED]: [],
  [DeliveryStatus.FAILED]: [DeliveryStatus.RETURNED],
  [DeliveryStatus.CANCELLED]: [],
  [DeliveryStatus.RETURNED]: [],
};

// Sync mapping: Order Status -> Delivery Status
export const ORDER_TO_DELIVERY_STATUS: Record<OrderStatus, DeliveryStatus> = {
  [OrderStatus.PENDING]: DeliveryStatus.CREATED,
  [OrderStatus.ACCEPTED]: DeliveryStatus.CREATED,
  [OrderStatus.PREPARING]: DeliveryStatus.CREATED,
  [OrderStatus.READY]: DeliveryStatus.SEARCHING_DRIVER,
  [OrderStatus.DRIVER_ASSIGNED]: DeliveryStatus.DRIVER_ASSIGNED,
  [OrderStatus.PICKED_UP]: DeliveryStatus.PICKED_UP,
  [OrderStatus.ON_THE_WAY]: DeliveryStatus.EN_ROUTE_TO_CUSTOMER,
  [OrderStatus.ARRIVED]: DeliveryStatus.ARRIVED_AT_CUSTOMER,
  [OrderStatus.DELIVERED]: DeliveryStatus.DELIVERED,
  [OrderStatus.CANCELLED]: DeliveryStatus.CANCELLED,
  [OrderStatus.REFUNDED]: DeliveryStatus.DELIVERED, // Already delivered
  [OrderStatus.FAILED]: DeliveryStatus.FAILED,
  [OrderStatus.DISPUTED]: DeliveryStatus.DELIVERED,
};
```

## API Integration

```typescript
// apps/backend/src/modules/orders/orders.controller.ts

@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private orderStateMachine: OrderStateMachine,
  ) {}

  @Patch(':id/status')
  @RequirePermissions(Permission.ORDERS_UPDATE)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    const order = await this.ordersService.findOne(id);
    
    const result = await this.orderStateMachine.transition({
      orderId: id,
      currentStatus: order.status,
      toStatus: dto.status,
      userId: user.id,
      userRole: user.primaryRole,
      metadata: dto.metadata,
      cancellationReason: dto.cancellationReason,
      disputeReason: dto.disputeReason,
    });

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    return result;
  }

  @Get(':id/valid-transitions')
  @RequirePermissions(Permission.ORDERS_READ)
  async getValidTransitions(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.orderStateMachine.getValidTransitions(id, user.primaryRole);
  }

  @Get(':id/history')
  @RequirePermissions(Permission.ORDERS_READ)
  async getStatusHistory(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.orderStateMachine.getStatusHistory(id);
  }
}
```

## Frontend Usage

```typescript
// packages/order-state-machine/src/hooks.ts

import { useMutation, useQuery } from '@tanstack/react-query';
import { OrderStatus, getValidNextStatuses } from './statuses';
import { UserRole } from '@delivery/types/roles';

export function useOrderTransitions(orderId: string, currentStatus: OrderStatus, userRole: UserRole) {
  const validNextStatuses = getValidNextStatuses(currentStatus, userRole);

  const transitionMutation = useMutation({
    mutationFn: (newStatus: OrderStatus) => api.orders.updateStatus(orderId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', orderId]);
      queryClient.invalidateQueries(['order', orderId, 'history']);
    },
  });

  return {
    validNextStatuses,
    transition: transitionMutation.mutate,
    isTransitioning: transitionMutation.isPending,
    error: transitionMutation.error,
  };
}

// Component example
export function OrderStatusActions({ order, userRole }: { order: Order; userRole: UserRole }) {
  const { validNextStatuses, transition, isTransitioning } = useOrderTransitions(
    order.id,
    order.status,
    userRole
  );

  if (validNextStatuses.length === 0) return null;

  return (
    <View style={styles.container}>
      {validNextStatuses.map(status => (
        <Button
          key={status}
          onPress={() => transition(status)}
          disabled={isTransitioning}
          variant={isDestructiveTransition(order.status, status) ? 'destructive' : 'primary'}
        >
          {getStatusLabel(status)}
        </Button>
      ))}
    </View>
  );
}
```