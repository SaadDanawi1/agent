# Delivery App Monorepo

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run db:generate

# Start development servers
npm run dev
```

## Project Structure

```
delivery-app/
├── apps/
│   ├── mobile/          # React Native + Expo app (all roles)
│   └── backend/         # NestJS API server
├── packages/
    ├── ui/              # Shared React Native components
    ├── types/           # Shared TypeScript types
    ├── config/          # Shared configuration
    ├── auth/            # Shared auth utilities
    ├── api/             # API client & contracts
    ├── database/        # Prisma schema & client
    ├── i18n/            # Internationalization
    ├── permissions/     # Permission system
    ├── role-navigation/ # Role-based navigation
    ├── order-state-machine/ # Order lifecycle
    └── utils/           # Shared utilities
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all dev servers |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | TypeScript check all packages |
| `npm run test` | Run all tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

Create `.env` file in root:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/delivery_app?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_ACCESS_TTL="15m"
JWT_REFRESH_TTL="30d"

# App
NODE_ENV="development"
API_PREFIX="api"
PORT=3000
CORS_ORIGIN="*"

# Lebanon Config
LEBANON_PHONE_PREFIX="+961"
DEFAULT_CURRENCY="USD"
EXCHANGE_RATE_USD_TO_LBP=89500

# SMS (Twilio)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Maps
GOOGLE_MAPS_API_KEY=""
MAPBOX_ACCESS_TOKEN=""

# Push Notifications
FIREBASE_SERVER_KEY=""
FCM_SENDER_ID=""

# Storage (S3)
S3_ENDPOINT=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_BUCKET=""
S3_REGION=""
```

## Development

### Mobile App (Expo)
```bash
cd apps/mobile
npm run dev          # Start Expo dev server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run build:ios    # Build for iOS (EAS)
npm run build:android # Build for Android (EAS)
```

### Backend (NestJS)
```bash
cd apps/backend
npm run start:dev    # Start with hot reload
npm run start:prod   # Production build
npm run test         # Run tests
npm run test:e2e     # E2E tests
```

## Architecture Docs

See `docs/architecture/` for detailed architecture documentation:
- `MONOREPO_STRUCTURE.md` - Monorepo layout
- `DATABASE_ERD.md` - Database schema & ERD
- `ROLE_PERMISSION_ARCHITECTURE.md` - RBAC system
- `AUTHENTICATION_FLOW.md` - Auth flows
- `NAVIGATION_ARCHITECTURE.md` - Navigation structure
- `ORDER_STATE_MACHINE.md` - Order lifecycle
- `API_ARCHITECTURE.md` - API design & guards

## Tech Stack

- **Mobile**: React Native, Expo, TypeScript, React Navigation, React Query
- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL, Redis
- **Real-time**: Socket.IO
- **Maps**: Google Maps / Mapbox
- **Payments**: Stripe, Tap, Local providers
- **Push**: Firebase Cloud Messaging
- **Storage**: S3-compatible (MinIO, AWS S3)
- **CI/CD**: GitHub Actions

## License

Private - All rights reserved