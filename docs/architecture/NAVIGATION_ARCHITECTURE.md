# Navigation Architecture (Role-Based Routing)

## Overview
Single React Native app with dynamic navigation based on user's active role. Navigation structure is determined at runtime after authentication.

## Navigation Structure

```
App Navigator (Root)
│
├── Auth Stack (Unauthenticated)
│   ├── Welcome / Onboarding
│   ├── Login (Phone/Email)
│   ├── OTP Verification
│   ├── Register (Merchant/Driver onboarding)
│   ├── Forgot Password
│   └── Terms & Privacy
│
└── Main App Stack (Authenticated)
    │
    ├── Role Router → Determines which navigator to render
    │
    ├── Customer Navigator (Bottom Tabs)
    │   ├── Home Tab
    │   │   ├── Home Screen
    │   │   ├── Search Screen
    │   │   ├── Category Screen
    │   │   ├── Restaurant Detail
    │   │   ├── Menu Screen
    │   │   └── Cart Screen
    │   ├── Orders Tab
    │   │   ├── Orders List (Active/History)
    │   │   ├── Order Detail
    │   │   └── Tracking Screen (Live)
    │   ├── Wallet Tab
    │   │   ├── Wallet Home
    │   │   ├── Add Funds
    │   │   ├── Transaction History
    │   │   └── Promo Codes
    │   └── Profile Tab
    │       ├── Profile Screen
    │       ├── Addresses
    │       ├── Payment Methods
    │       ├── Favorites
    │       ├── Notifications
    │       ├── Support
    │       └── Settings
    │
    ├── Driver Navigator (Bottom Tabs + Modals)
    │   ├── Dashboard Tab
    │   │   ├── Dashboard Home (Online/Offline toggle)
    │   │   ├── Earnings Screen
    │   │   │   ├── Today/Week/Month
    │   │   │   ├── Delivery Breakdown
    │   │   │   └── Payout History
    │   │   ├── Performance Screen
    │   │   │   ├── Rating
    │   │   │   ├── Acceptance Rate
    │   │   │   └── Completion Rate
    │   │   └── Schedule Screen
    │   ├── Deliveries Tab
    │   │   ├── Active Delivery (Full-screen flow)
    │   │   │   ├── Request Modal
    │   │   │   ├── Navigate to Restaurant
    │   │   │   ├── Pickup Flow
    │   │   │   ├── Navigate to Customer
    │   │   │   └── Delivery Confirmation
    │   │   ├── Delivery History
    │   │   └── Upcoming Scheduled
    │   ├── Map Tab (Full-screen map)
    │   │   ├── Live Map View
    │   │   ├── Zone Heatmap
    │   │   └── Nearby Orders
    │   └── Profile Tab
    │       ├── Profile & Documents
    │       ├── Vehicle Management
    │       ├── Bank Account / Payout
    │       ├── Support
    │       └── Settings
    │
    ├── Merchant Navigator (Bottom Tabs)
    │   ├── Dashboard Tab
    │   │   ├── Dashboard Home (KPIs)
    │   │   ├── Revenue Analytics
    │   │   └── Order Analytics
    │   ├── Orders Tab
    │   │   ├── Incoming Orders (Real-time)
    │   │   │   ├── New Order Modal
    │   │   │   ├── Preparing Screen
    │   │   │   └── Ready for Pickup
    │   │   ├── Active Orders
    │   │   ├── Order History
    │   │   └── Cancelled/Rejected
    │   ├── Menu Tab
    │   │   ├── Categories List
    │   │   ├── Products List
    │   │   ├── Add/Edit Product
    │   │   ├── Modifiers Management
    │   │   └── Availability Toggle
    │   ├── Settings Tab
    │   │   ├── Restaurant Profile
    │   │   ├── Opening Hours
    │   │   ├── Delivery Zones
    │   │   ├── Commission Settings
    │   │   ├── Printer Setup
    │   │   └── Staff Accounts
    │   └── Profile Tab
    │       ├── Business Info
    │       ├── Bank Account
    │       ├── Payout Schedule
    │       ├── Documents
    │       └── Support
    │
    ├── Admin Navigator (Drawer + Tabs)
    │   ├── Dashboard
    │   │   ├── Overview KPIs
    │   │   ├── Live Operations Map
    │   │   └── Real-time Charts
    │   ├── Orders Management
    │   │   ├── All Orders (Search/Filter)
    │   │   ├── Order Detail + Actions
    │   │   ├── Assign/Reassign Driver
    │   │   └── Refund Management
    │   ├── Drivers Management
    │   │   ├── Drivers List
    │   │   ├── Driver Detail + Docs
    │   │   ├── Approve/Suspend
    │   │   ├── Earnings Overview
    │   │   └── Performance Reports
    │   ├── Merchants Management
    │   │   ├── Merchants List
    │   │   ├── Merchant Detail
    │   │   ├── Approve/Suspend
    │   │   ├── Commission Config
    │   │   └── Revenue Reports
    │   ├── Customers Management
    │   │   ├── Customers List
    │   │   ├── Customer Detail
    │   │   ├── Wallet Management
    │   │   └── Complaints
    │   ├── Operations
    │   │   ├── Live Dispatch Board
    │   │   ├── Zone Management
    │   │   ├── Promo Codes
    │   │   ├── Fee Settings
    │   │   └── System Config
    │   ├── Finance
    │   │   ├── Revenue Reports
    │   │   ├── Driver Payouts
    │   │   ├── Merchant Payouts
    │   │   ├── Wallet Transactions
    │   │   └── Tax Reports
    │   ├── Support
    │   │   ├── Tickets Dashboard
    │   │   ├── Ticket Detail
    │   │   └── Canned Responses
    │   ├── Analytics
    │   │   ├── Business Intelligence
    │   │   ├── Custom Reports
    │   │   └── Data Export
    │   └── Settings
    │       ├── Admin Users
    │       ├── Roles & Permissions
    │       ├── Audit Logs
    │       └── System Health
    │
    ├── Operations Navigator (Focused on active orders)
    │   ├── Live Board (Default)
    │   │   ├── Active Orders List
    │   │   ├── Searching Drivers
    │   │   ├── Issues Queue
    │   │   └── Quick Actions
    │   ├── Orders Management
    │   │   ├── All Orders
    │   │   ├── Assign Driver
    │   │   └── Reassign Driver
    │   ├── Drivers Live
    │   │   ├── Online Drivers Map
    │   │   ├── Driver Details
    │   │   └── Contact Driver
    │   ├── Merchants Live
    │   │   ├── Active Merchants
    │   │   ├── Contact Merchant
    │   │   └── Prep Time Issues
    │   └── Incidents
    │       ├── Active Incidents
    │       ├── Resolve Incident
    │       └── Incident History
    │
    ├── Support Navigator
    │   ├── Tickets Dashboard
    │   │   ├── All Tickets (Filter by role)
    │   │   ├── My Assigned
    │   │   └── Unassigned
    │   ├── Ticket Detail
    │   │   ├── Conversation
    │   │   ├── Order Context
    │   │   ├── Internal Notes
    │   │   └── Actions (Refund, Credit, etc.)
    │   ├── Customers Support
    │   ├── Drivers Support
    │   ├── Merchants Support
    │   └── Knowledge Base
    │
    └── Finance Navigator
        ├── Revenue Overview
        ├── Commissions
        ├── Driver Payouts
        │   ├── Pending Payouts
        │   ├── Process Payout
        │   └── Payout History
        ├── Merchant Payouts
        ├── Wallet Transactions
        ├── Refunds
        ├── Payment Transactions
        └── Tax & Compliance
```

## Role Router Implementation

```typescript
// packages/role-navigation/src/RoleRouter.tsx

import React from 'react';
import { useAuth } from '@delivery/auth';
import { UserRole } from '@delivery/types/roles';
import { CustomerNavigator } from './navigators/CustomerNavigator';
import { DriverNavigator } from './navigators/DriverNavigator';
import { MerchantNavigator } from './navigators/MerchantNavigator';
import { AdminNavigator } from './navigators/AdminNavigator';
import { OperationsNavigator } from './navigators/OperationsNavigator';
import { SupportNavigator } from './navigators/SupportNavigator';
import { FinanceNavigator } from './navigators/FinanceNavigator';
import { LoadingScreen } from '@delivery/ui/LoadingScreen';

export function RoleRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null; // Auth stack handles this
  }

  const primaryRole = user.primaryRole;

  switch (primaryRole) {
    case UserRole.CUSTOMER:
      return <CustomerNavigator />;

    case UserRole.DRIVER:
      return <DriverNavigator />;

    case UserRole.MERCHANT:
      return <MerchantNavigator />;

    case UserRole.ADMIN:
    case UserRole.SUPER_ADMIN:
      return <AdminNavigator />;

    case UserRole.OPERATIONS:
      return <OperationsNavigator />;

    case UserRole.SUPPORT:
      return <SupportNavigator />;

    case UserRole.FINANCE:
      return <FinanceNavigator />;

    default:
      return <CustomerNavigator />; // Fallback
  }
}

// Role switcher component (for multi-role users)
export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const [showSwitcher, setShowSwitcher] = React.useState(false);

  if (!user || user.roles.length <= 1) {
    return null;
  }

  return (
    <Modal visible={showSwitcher} onRequestClose={() => setShowSwitcher(false)}>
      <View style={styles.container}>
        <Text style={styles.title}>Switch Mode</Text>
        {user.roles.map(role => (
          <TouchableOpacity
            key={role}
            onPress={() => {
              switchRole(role);
              setShowSwitcher(false);
            }}
            style={[
              styles.roleButton,
              role === user.primaryRole && styles.activeRole,
            ]}
          >
            <Text style={styles.roleText}>{getRoleLabel(role)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.CUSTOMER]: 'Customer',
    [UserRole.DRIVER]: 'Driver',
    [UserRole.MERCHANT]: 'Merchant',
    [UserRole.ADMIN]: 'Admin',
    [UserRole.OPERATIONS]: 'Operations',
    [UserRole.SUPPORT]: 'Support',
    [UserRole.FINANCE]: 'Finance',
    [UserRole.SUPER_ADMIN]: 'Super Admin',
  };
  return labels[role] || role;
}
```

## Lazy Loading Navigators (Code Splitting)

```typescript
// packages/role-navigation/src/lazyNavigators.ts

import React, { lazy, Suspense } from 'react';
import { LoadingScreen } from '@delivery/ui/LoadingScreen';

// Lazy load each navigator to reduce initial bundle size
const CustomerNavigator = lazy(() =>
  import('./navigators/CustomerNavigator').then(module => ({
    default: module.CustomerNavigator,
  }))
);

const DriverNavigator = lazy(() =>
  import('./navigators/DriverNavigator').then(module => ({
    default: module.DriverNavigator,
  }))
);

const MerchantNavigator = lazy(() =>
  import('./navigators/MerchantNavigator').then(module => ({
    default: module.MerchantNavigator,
  }))
);

const AdminNavigator = lazy(() =>
  import('./navigators/AdminNavigator').then(module => ({
    default: module.AdminNavigator,
  }))
);

const OperationsNavigator = lazy(() =>
  import('./navigators/OperationsNavigator').then(module => ({
    default: module.OperationsNavigator,
  }))
);

const SupportNavigator = lazy(() =>
  import('./navigators/SupportNavigator').then(module => ({
    default: module.SupportNavigator,
  }))
);

const FinanceNavigator = lazy(() =>
  import('./navigators/FinanceNavigator').then(module => ({
    default: module.FinanceNavigator,
  }))
);

export const LazyNavigators: Record<UserRole, React.ComponentType> = {
  [UserRole.CUSTOMER]: CustomerNavigator,
  [UserRole.DRIVER]: DriverNavigator,
  [UserRole.MERCHANT]: MerchantNavigator,
  [UserRole.ADMIN]: AdminNavigator,
  [UserRole.SUPER_ADMIN]: AdminNavigator,
  [UserRole.OPERATIONS]: OperationsNavigator,
  [UserRole.SUPPORT]: SupportNavigator,
  [UserRole.FINANCE]: FinanceNavigator,
};

// Wrapper with Suspense
export function LazyRoleNavigator({ role }: { role: UserRole }) {
  const Navigator = LazyNavigators[role];

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Navigator />
    </Suspense>
  );
}
```

## Deep Linking & Universal Links

```typescript
// packages/role-navigation/src/deepLinking.ts

import { LinkingOptions } from '@react-navigation/native';
import { UserRole } from '@delivery/types/roles';

const PREFIX = 'deliveryapp://';

const customerRoutes = {
  home: '',
  search: 'search',
  restaurant: 'restaurant/:restaurantId',
  menu: 'restaurant/:restaurantId/menu',
  cart: 'cart',
  checkout: 'checkout',
  tracking: 'tracking/:orderId',
  orders: 'orders',
  orderDetail: 'orders/:orderId',
  wallet: 'wallet',
  profile: 'profile',
  addresses: 'profile/addresses',
  settings: 'profile/settings',
};

const driverRoutes = {
  dashboard: 'dashboard',
  earnings: 'earnings',
  performance: 'performance',
  deliveries: 'deliveries',
  activeDelivery: 'deliveries/active/:deliveryId',
  history: 'deliveries/history',
  map: 'map',
  profile: 'profile',
  documents: 'profile/documents',
  vehicle: 'profile/vehicle',
  payout: 'profile/payout',
  settings: 'profile/settings',
};

const merchantRoutes = {
  dashboard: 'dashboard',
  orders: 'orders',
  incoming: 'orders/incoming',
  active: 'orders/active',
  history: 'orders/history',
  orderDetail: 'orders/:orderId',
  menu: 'menu',
  categories: 'menu/categories',
  products: 'menu/products',
  productEdit: 'menu/products/:productId/edit',
  settings: 'settings',
  profile: 'profile',
};

const adminRoutes = {
  dashboard: 'dashboard',
  orders: 'orders',
  orderDetail: 'orders/:orderId',
  drivers: 'drivers',
  driverDetail: 'drivers/:driverId',
  merchants: 'merchants',
  merchantDetail: 'merchants/:merchantId',
  customers: 'customers',
  customerDetail: 'customers/:customerId',
  operations: 'operations',
  finance: 'finance',
  support: 'support',
  analytics: 'analytics',
  settings: 'settings',
};

export function getLinkingConfig(role: UserRole): LinkingOptions<any> {
  const routeMaps: Record<UserRole, Record<string, string>> = {
    [UserRole.CUSTOMER]: customerRoutes,
    [UserRole.DRIVER]: driverRoutes,
    [UserRole.MERCHANT]: merchantRoutes,
    [UserRole.ADMIN]: adminRoutes,
    [UserRole.SUPER_ADMIN]: adminRoutes,
    [UserRole.OPERATIONS]: { ...adminRoutes, dashboard: 'operations' },
    [UserRole.SUPPORT]: { ...adminRoutes, dashboard: 'support' },
    [UserRole.FINANCE]: { ...adminRoutes, dashboard: 'finance' },
  };

  const routes = routeMaps[role] || customerRoutes;

  return {
    prefixes: [PREFIX, 'https://app.deliveryapp.lb'],
    config: {
      screens: routes,
    },
    getPathFromState: (state) => {
      // Custom path generation
      return PREFIX + state.routes.map(r => r.name).join('/');
    },
  };
}
```

## Navigation Guards (Frontend)

```typescript
// packages/role-navigation/src/guards.tsx

import React from 'react';
import { usePermissions, useAuth } from '@delivery/auth';
import { Permission, UserRole } from '@delivery/types';

interface RouteGuardProps {
  children: React.ReactNode;
  permissions?: Permission[];
  roles?: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RouteGuard({
  children,
  permissions = [],
  roles = [],
  fallback = null,
}: RouteGuardProps) {
  const { hasPermission, hasAnyRole, user } = usePermissions();
  const { navigation } = useAuth(); // or useNavigation()

  const hasRequiredPermissions = permissions.every(hasPermission);
  const hasRequiredRoles = roles.length === 0 || hasAnyRole(roles);

  if (!user) {
    return <AuthRedirectScreen />;
  }

  if (!hasRequiredPermissions || !hasRequiredRoles) {
    // Log unauthorized access attempt
    console.warn('Unauthorized navigation attempt', {
      userId: user.id,
      requiredPermissions: permissions,
      requiredRoles: roles,
      userRoles: user.roles,
    });
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Higher-order component for screen-level protection
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: { permissions?: Permission[]; roles?: UserRole[] } = {}
) {
  return function GuardedComponent(props: P) {
    return (
      <RouteGuard permissions={options.permissions} roles={options.roles}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}

// Hook for conditional rendering
export function useNavigationGuard() {
  const { hasPermission, hasAnyRole } = usePermissions();

  return {
    canNavigate: (permissions: Permission[], roles: UserRole[] = []) => {
      return permissions.every(hasPermission) && (roles.length === 0 || hasAnyRole(roles));
    },
  };
}
```

## App Entry Point

```typescript
// apps/mobile/App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from '@delivery/auth';
import { RoleRouter } from '@delivery/role-navigation/RoleRouter';
import { AuthStack } from './navigation/AuthStack';
import { Providers } from './providers';
import { ThemeProvider } from '@delivery/ui/ThemeProvider';
import { I18nProvider } from '@delivery/i18n';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoadingScreen />;
  }

  return user ? <RoleRouter /> : <AuthStack />;
}

export default function App() {
  return (
    <Providers>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <NavigationContainer
              linking={getLinkingConfig()} // Dynamic based on role
              onReady={() => console.log('Navigation ready')}
            >
              <AppContent />
            </NavigationContainer>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </Providers>
  );
}
```

## Navigation State Persistence

```typescript
// packages/role-navigation/src/persistence.ts

import { PersistNavigationState } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'NAVIGATION_STATE';

export async function saveNavigationState(state: any): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save navigation state', error);
  }
}

export async function loadNavigationState(): Promise<any | undefined> {
  try {
    const state = await SecureStore.getItemAsync(STORAGE_KEY);
    return state ? JSON.parse(state) : undefined;
  } catch (error) {
    console.warn('Failed to load navigation state', error);
    return undefined;
  }
}

export async function clearNavigationState(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear navigation state', error);
  }
}
```

## Key Principles

1. **Single App Bundle** - All navigators in one app, lazy-loaded
2. **Role Determines UI** - Primary role controls which navigator mounts
3. **Backend Enforces Auth** - Frontend guards are UX only; API validates every request
4. **Code Splitting** - Each navigator is a separate chunk
5. **Deep Linking** - Role-specific link configs
6. **Multi-Role Ready** - Architecture supports role switching
7. **Persistence** - Navigation state saved per role
8. **Type Safety** - TypeScript ensures route params match