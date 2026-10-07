# Monorepo Structure

## Overview
Unified delivery application monorepo using Nx/Turbo for build orchestration.

## Directory Structure

```
delivery-app/
├── apps/
│   ├── mobile/                 # React Native + Expo (main app for all roles)
│   ├── backend/                # NestJS API server
│   └── admin-web/              # Optional: Admin web dashboard (React/Next.js)
├── packages/
│   ├── ui/                     # Shared UI components (React Native)
│   ├── types/                  # Shared TypeScript types & interfaces
│   ├── config/                 # Shared configuration (env, constants)
│   ├── auth/                   # Shared authentication utilities
│   ├── api/                    # API client & contracts (tRPC/OpenAPI)
│   ├── database/               # Database schema, migrations, Prisma client
│   ├── i18n/                   # Internationalization (ar/en, RTL/LTR)
│   ├── permissions/            # Permission definitions & guards
│   ├── role-navigation/        # Role-based navigation logic
│   ├── order-state-machine/    # Order lifecycle state machine
│   └── utils/                  # Shared utilities (validation, formatting)
├── tools/
│   ├── generators/             # Custom code generators
│   └── scripts/                # Build/deploy/migration scripts
├── turbo.json                  # TurboRepo config
├── package.json
├── tsconfig.base.json
├── nx.json                     # Nx config (if using Nx)
└── README.md
```

## Package Dependencies

### apps/mobile
- packages/ui
- packages/types
- packages/config
- packages/auth
- packages/api
- packages/i18n
- packages/permissions
- packages/role-navigation
- packages/order-state-machine
- packages/utils

### apps/backend
- packages/types
- packages/config
- packages/auth
- packages/database
- packages/permissions
- packages/order-state-machine
- packages/utils

### apps/admin-web (optional)
- packages/ui (web components)
- packages/types
- packages/config
- packages/auth
- packages/api
- packages/i18n
- packages/permissions

## Shared Package Details

### packages/types
Core TypeScript interfaces shared across all apps:
- User, Role, Permission types
- Order, Delivery, Merchant, Driver entities
- API request/response types
- WebSocket event types

### packages/config
- Environment variables validation (zod)
- Feature flags
- Constants (roles, order statuses, currencies)
- Lebanon-specific config (zones, currencies, phone format)

### packages/auth
- JWT token utilities (sign, verify, refresh)
- Password hashing (bcrypt/argon2)
- OTP generation/validation
- Secure storage helpers (mobile)

### packages/api
- tRPC router definitions OR OpenAPI specs
- API client with auth interceptors
- React Query / TanStack Query hooks

### packages/database
- Prisma schema
- Migrations
- Seed scripts
- Repository patterns

### packages/i18n
- Translation files (ar.json, en.json)
- RTL/LTR utilities
- Date/number formatting for Lebanon

### packages/permissions
- Permission enum/definitions
- Role-permission mapping
- Authorization guards (backend)
- Permission hooks (frontend)

### packages/role-navigation
- Role-based navigator factory
- Route definitions per role
- Navigation guards

### packages/order-state-machine
- Order status enum
- Valid transitions
- Transition guards
- Side effects per transition

### packages/utils
- Validation schemas (zod)
- Formatting (currency, phone, date)
- Lebanese address utilities
- Exchange rate helpers