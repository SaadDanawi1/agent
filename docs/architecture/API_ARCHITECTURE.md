# API Architecture with Authorization Guards

## Overview
RESTful API built with NestJS, featuring comprehensive authorization, validation, rate limiting, and real-time capabilities via Socket.IO.

## API Structure

```
apps/backend/src/
├── main.ts                 # App bootstrap, global pipes/guards
├── app.module.ts           # Root module
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── permissions.decorator.ts
│   │   ├── roles.decorator.ts
│   │   ├── public.decorator.ts
│   │   └── audit-log.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── permissions.guard.ts
│   │   ├── roles.guard.ts
│   │   ├── rate-limit.guard.ts
│   │   └── resource-owner.guard.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   ├── audit-log.interceptor.ts
│   │   ├── cache.interceptor.ts
│   │   └── timeout.interceptor.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   ├── validation-exception.filter.ts
│   │   └── prisma-exception.filter.ts
│   ├── pipes/
│   │   ├── validation.pipe.ts
│   │   ├── parse-uuid.pipe.ts
│   │   └── pagination.pipe.ts
│   ├── dto/
│   │   ├── pagination.dto.ts
│   │   ├── cursor-pagination.dto.ts
│   │   └── api-response.dto.ts
│   └── utils/
│       ├── api-response.util.ts
│       └── error-codes.ts
├── config/
│   ├── configuration.ts
│   ├── validation.ts
│   └── environment.ts
├── modules/
│   ├── auth/               # Authentication module
│   ├── users/              # User management
│   ├── customers/          # Customer profiles
│   ├── drivers/            # Driver profiles & operations
│   ├── merchants/          # Merchant profiles & operations
│   ├── orders/             # Order management
│   ├── deliveries/         # Delivery tracking
│   ├── products/           # Product & menu management
│   ├── payments/           # Payment processing
│   ├── wallets/            # Wallet & transactions
│   ├── notifications/      # Push & in-app notifications
│   ├── chat/               # In-app chat
│   ├── support/            # Support tickets
│   ├── zones/              # Delivery zones
│   ├── promos/             # Promo codes
│   ├── analytics/          # Analytics & reporting
│   ├── settings/           # Platform settings
│   ├── audit/              # Audit logs
│   └── websocket/          # Real-time gateway
├── prisma/
│   ├── prisma.module.ts
│   ├── prisma.service.ts
│   └── middleware/
│       ├── soft-delete.middleware.ts
│       └── audit.middleware.ts
└── health/
    ├── health.controller.ts
    └── health.module.ts
```

## Global Setup (main.ts)

```typescript
// apps/backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || '*';

  // Global prefix & versioning
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: configService.get('NODE_ENV') === 'production',
      validationError: { target: false },
    }),
  );

  // Global guards (order matters!)
  // 1. Rate limiting (applied to all routes)
  // app.useGlobalGuards(app.get(RateLimitGuard));
  
  // 2. JWT Auth (applied to all non-public routes)
  // app.useGlobalGuards(app.get(JwtAuthGuard));
  
  // 3. Permissions (applied via decorators)

  // Global interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new AuditLogInterceptor(),
  );

  // Global filters
  app.useGlobalFilters(
    new PrismaExceptionFilter(),
    new ValidationExceptionFilter(),
    new HttpExceptionFilter(),
  );

  // Swagger/OpenAPI
  if (configService.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Delivery App API')
      .setDescription('Unified Delivery Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User management')
      .addTag('Orders', 'Order management')
      .addTag('Drivers', 'Driver operations')
      .addTag('Merchants', 'Merchant operations')
      .addTag('Admin', 'Admin operations')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 API Docs: http://localhost:${port}/docs`);
}

bootstrap();
```

## Authentication Guard

```typescript
// apps/backend/src/common/guards/jwt-auth.guard.ts

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenService } from '../../modules/auth/jwt/token.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }

    // Check if token is revoked
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token && this.tokenService.isRevoked(token)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Attach user to request
    request.user = user;
    return user;
  }
}
```

## Permissions Guard (Complete)

```typescript
// apps/backend/src/common/guards/permissions.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, ROLES_KEY, RESOURCE_OWNER_KEY } from '../decorators/permissions.decorator';
import { Permission, userHasPermission } from '@delivery/permissions';
import { UserRole } from '@delivery/types/roles';
import { AuthUser } from '@delivery/auth';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const resourceOwnerFn = this.reflector.getAllAndOverride<
      (req: any) => Promise<string> | string
    >(RESOURCE_OWNER_KEY, [context.getHandler(), context.getClass()]);

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is not active');
    }

    // Check role requirement
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = user.roles.some(role => requiredRoles.includes(role));
      if (!hasRole) {
        throw new ForbiddenException(`Required role: ${requiredRoles.join(' or ')}`);
      }
    }

    // Check permission requirement
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every(permission =>
        userHasPermission(user.roles, permission)
      );
      if (!hasPermission) {
        throw new ForbiddenException(`Missing required permissions: ${requiredPermissions.join(', ')}`);
      }
    }

    // Check resource ownership
    if (resourceOwnerFn) {
      const resourceOwnerId = await resourceOwnerFn(request);
      if (resourceOwnerId && resourceOwnerId !== user.id) {
        const canManageOthers = userHasPermission(user.roles, Permission.ORDERS_VIEW_ALL) ||
                                userHasPermission(user.roles, Permission.CUSTOMERS_VIEW_ORDERS) ||
                                userHasPermission(user.roles, Permission.DRIVERS_VIEW_EARNINGS) ||
                                userHasPermission(user.roles, Permission.MERCHANTS_VIEW_ORDERS) ||
                                userHasPermission(user.roles, Permission.ADMIN);
        
        if (!canManageOthers) {
          throw new ForbiddenException('Access denied: not resource owner');
        }
      }
    }

    return true;
  }
}
```

## Decorators

```typescript
// apps/backend/src/common/decorators/permissions.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { Permission } from '@delivery/permissions';
import { UserRole } from '@delivery/types/roles';

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';
export const RESOURCE_OWNER_KEY = 'resourceOwner';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireRoles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);

export const ResourceOwner = (getResourceOwnerId: (req: any) => Promise<string> | string) =>
  SetMetadata(RESOURCE_OWNER_KEY, getResourceOwnerId);

// apps/backend/src/common/decorators/current-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '@delivery/auth';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser;
    return data ? user?.[data] : user;
  },
);

// apps/backend/src/common/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// apps/backend/src/common/decorators/audit-log.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'auditLog';
export const AuditLog = (action: string, resource: string) =>
  SetMetadata(AUDIT_LOG_KEY, { action, resource });
```

## Rate Limiting

```typescript
// apps/backend/src/common/guards/rate-limit.guard.ts

import { Injectable, CanActivate, ExecutionContext, TooManyRequestsException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@delivery/database/RedisService';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const userId = request.user?.id;
    
    // Different limits for authenticated vs anonymous
    const key = userId ? `ratelimit:user:${userId}` : `ratelimit:ip:${ip}`;
    const limit = userId ? 100 : 20; // requests per window
    const windowMs = 60 * 1000; // 1 minute

    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.pexpire(key, windowMs);
    }

    if (current > limit) {
      const ttl = await this.redis.ttl(key);
      throw new TooManyRequestsException({
        message: 'Too many requests',
        retryAfter: ttl,
      });
    }

    // Add rate limit headers
    request.rateLimit = {
      limit,
      remaining: Math.max(0, limit - current),
      reset: Date.now() + windowMs,
    };

    return true;
  }
}

// Stricter rate limiting for auth endpoints
@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const key = `ratelimit:auth:${ip}`;
    const limit = 5; // 5 attempts per 15 minutes
    const windowMs = 15 * 60 * 1000;

    const current = await this.redis.incr(key);
    if (current === 1) await this.redis.pexpire(key, windowMs);

    if (current > limit) {
      throw new TooManyRequestsException('Too many authentication attempts. Try again later.');
    }

    return true;
  }
}
```

## Resource Ownership Helpers

```typescript
// apps/backend/src/common/decorators/resource-owner.decorator.ts

import { Request } from 'express';

// Factory functions for common resource ownership checks
export const OrderOwner = () => ResourceOwner(async (req: Request) => {
  const orderId = req.params.id || req.body.orderId;
  // This would be resolved by a service - simplified here
  return req.order?.customerId; // Set by interceptor or guard
});

export const DeliveryOwner = () => ResourceOwner(async (req: Request) => {
  const deliveryId = req.params.id;
  return req.delivery?.driverId;
});

export const MerchantOwner = () => ResourceOwner(async (req: Request) => {
  const merchantId = req.params.id || req.params.merchantId;
  return req.merchant?.userId;
});

export const WalletOwner = () => ResourceOwner(async (req: Request) => {
  return req.params.userId || req.user?.id;
});
```

## API Response Standardization

```typescript
// apps/backend/src/common/dto/api-response.dto.ts

export class ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;

  static ok<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
    return { success: true, data, meta };
  }

  static error(error: ApiError, meta?: ApiMeta): ApiResponse<null> {
    return { success: false, error, meta };
  }
}

export class ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}

export class ApiMeta {
  timestamp: string = new Date().toISOString();
  requestId?: string;
  pagination?: PaginationMeta;
  rateLimit?: RateLimitMeta;
}

export class PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class RateLimitMeta {
  limit: number;
  remaining: number;
  reset: number;
}
```

```typescript
// apps/backend/src/common/interceptors/transform.interceptor.ts

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      map(data => {
        // If already formatted, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        return ApiResponse.ok(data, {
          requestId: request.headers['x-request-id'],
          rateLimit: request.rateLimit,
        });
      }),
    );
  }
}
```

## Audit Log Interceptor

```typescript
// apps/backend/src/common/interceptors/audit-log.interceptor.ts

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AUDIT_LOG_KEY } from '../decorators/audit-log.decorator';
import { PrismaService } from '@delivery/database/PrismaService';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditConfig = this.reflector.getAllAndOverride<{ action: string; resource: string }>(
      AUDIT_LOG_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (response) => {
          if (!auditConfig || !user) return;

          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action: auditConfig.action,
              resource: auditConfig.resource,
              resourceId: request.params.id || request.body?.id,
              newValue: response?.data || response,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
              durationMs: Date.now() - startTime,
            },
          }).catch(err => console.error('Audit log failed:', err));
        },
        error: async (error) => {
          if (!auditConfig || !user) return;

          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action: auditConfig.action,
              resource: auditConfig.resource,
              resourceId: request.params.id || request.body?.id,
              newValue: { error: error.message },
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
              durationMs: Date.now() - startTime,
            },
          }).catch(err => console.error('Audit log failed:', err));
        },
      }),
    );
  }
}
```

## Example Controller with Full Authorization

```typescript
// apps/backend/src/modules/orders/orders.controller.ts

import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions, RequireRoles, CurrentUser, AuditLog } from '../../common/decorators';
import { Permission } from '@delivery/permissions';
import { UserRole } from '@delivery/types/roles';
import { AuthUser } from '@delivery/auth';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @RequirePermissions(Permission.ORDERS_CREATE)
  @AuditLog('CREATE', 'ORDER')
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.create(user.id, dto);
  }

  @Get()
  @RequirePermissions(Permission.ORDERS_READ)
  async findAll(
    @Query() query: OrderQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    // Customers see only their orders, others see based on permissions
    const isCustomer = user.roles.includes(UserRole.CUSTOMER);
    return this.ordersService.findAll(query, isCustomer ? user.id : undefined);
  }

  @Get(':id')
  @RequirePermissions(Permission.ORDERS_READ)
  @ResourceOwner((req) => req.order?.customerId)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.ORDERS_UPDATE)
  @ResourceOwner((req) => req.order?.customerId)
  @AuditLog('UPDATE', 'ORDER')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.ORDERS_UPDATE)
  @AuditLog('STATUS_CHANGE', 'ORDER')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.updateStatus(id, dto, user);
  }

  @Post(':id/assign-driver')
  @RequirePermissions(Permission.ORDERS_ASSIGN_DRIVER)
  @RequireRoles(UserRole.ADMIN, UserRole.OPERATIONS, UserRole.SUPER_ADMIN)
  @AuditLog('ASSIGN_DRIVER', 'ORDER')
  async assignDriver(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignDriverDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.assignDriver(id, dto.driverId, user.id);
  }

  @Post(':id/refund')
  @RequirePermissions(Permission.ORDERS_REFUND)
  @RequireRoles(UserRole.ADMIN, UserRole.FINANCE, UserRole.SUPPORT, UserRole.SUPER_ADMIN)
  @AuditLog('REFUND', 'ORDER')
  async refund(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RefundDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.refund(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions(Permission.ORDERS_CANCEL)
  @RequireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @AuditLog('DELETE', 'ORDER')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.softDelete(id);
  }
}
```

## WebSocket Gateway with Auth

```typescript
// apps/backend/src/modules/websocket/websocket.gateway.ts

import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket,
  MessageBody, WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../auth/jwt/token.service';
import { PermissionsService } from '@delivery/permissions';
import { UserRole } from '@delivery/types/roles';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds

  constructor(
    private jwtService: JwtService,
    private tokenService: TokenService,
    private permissions: PermissionsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw new WsException('Authentication required');
      }

      const payload = this.jwtService.verify(token);
      
      if (this.tokenService.isRevoked(token)) {
        throw new WsException('Token revoked');
      }

      // Attach user to socket
      client.data.user = payload;
      client.data.roles = payload.roles;
      client.data.permissions = payload.permissions;

      // Track user sockets
      const userSockets = this.userSockets.get(payload.sub) || new Set();
      userSockets.add(client.id);
      this.userSockets.set(payload.sub, userSockets);

      // Join role-based rooms
      payload.roles.forEach((role: UserRole) => {
        client.join(`role:${role}`);
      });

      // Join user-specific room
      client.join(`user:${payload.sub}`);

      console.log(`Client connected: ${client.id} (${payload.sub})`);
    } catch (error) {
      client.disconnect();
      throw new WsException('Invalid token');
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('location:update')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { latitude: number; longitude: number; heading?: number },
  ) {
    const user = client.data.user;
    
    // Only drivers can send location
    if (!user.roles.includes(UserRole.DRIVER)) {
      throw new WsException('Only drivers can update location');
    }

    // Update driver location in DB
    await this.updateDriverLocation(user.sub, data);

    // Broadcast to relevant parties
    this.broadcastDriverLocation(user.sub, data);
  }

  @SubscribeMessage('order:subscribe')
  async handleOrderSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const user = client.data.user;
    const order = await this.getOrder(data.orderId);

    // Check permission to subscribe
    const canSubscribe = this.canAccessOrder(user, order);
    if (!canSubscribe) {
      throw new WsException('Not authorized to track this order');
    }

    client.join(`order:${data.orderId}`);
  }

  // Server-side emit methods
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToRole(role: UserRole, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  emitToOrder(orderId: string, event: string, data: any) {
    this.server.to(`order:${orderId}`).emit(event, data);
  }

  // Broadcast driver location to customer, merchant, admin
  private broadcastDriverLocation(driverId: string, location: any) {
    // Get active deliveries for this driver
    // Emit to customers, merchants, admins tracking those orders
  }

  private canAccessOrder(user: any, order: any): boolean {
    // Customer owns order
    if (order.customerId === user.sub) return true;
    // Driver assigned
    if (order.driverId === user.sub) return true;
    // Merchant owns order
    if (order.merchantId === user.sub) return true;
    // Admin/Operations/Support can access all
    if (user.roles.some((r: UserRole) => [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.SUPPORT, UserRole.SUPER_ADMIN].includes(r))) return true;
    return false;
  }
}
```

## API Versioning & Deprecation

```typescript
// Versioning strategy in controllers
@Controller({ path: 'orders', version: '1' })
export class OrdersV1Controller { ... }

@Controller({ path: 'orders', version: '2' })
export class OrdersV2Controller { ... }

// Deprecation headers
@Get()
@Header('Deprecation', 'true')
@Header('Link', '<https://api.deliveryapp.lb/v2/orders>; rel="successor-version"')
async findAllV1() { ... }
```

## Testing Strategy

```typescript
// Test utilities
// apps/backend/test/utils/auth-test.utils.ts

export function createMockUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'test-user-id',
    phone: '+96170123456',
    name: 'Test User',
    roles: [UserRole.CUSTOMER],
    primaryRole: UserRole.CUSTOMER,
    permissions: [],
    status: 'ACTIVE',
    ...overrides,
  };
}

export function mockAuthGuard(user: AuthUser) {
  return {
    canActivate: jest.fn(() => true),
  };
}

// E2E test example
describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login and get token
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    authToken = response.body.data.accessToken;
  });

  it('should deny access without permission', () => {
    return request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(createOrderDto)
      .expect(403);
  });

  it('should allow admin to create order', () => {
    return request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createOrderDto)
      .expect(201);
  });
});
```

## Key Security Principles

1. **Defense in Depth** - Multiple guard layers (Rate Limit → Auth → Permissions → Resource Owner)
2. **Fail Closed** - Default deny, explicit allow via decorators
3. **Audit Everything** - All mutating operations logged
4. **Token Rotation** - Refresh tokens rotated on use
5. **Resource Ownership** - Users can only access their resources unless elevated permissions
6. **Role + Permission** - Both checked; permissions are source of truth
7. **Rate Limiting** - Per-user and per-IP limits
8. **Input Validation** - Global validation pipe with strict options
9. **Error Handling** - Standardized error responses, no stack traces in production
10. **CORS & Headers** - Strict CORS, security headers via Helmet