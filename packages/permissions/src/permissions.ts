export enum Permission {
  // Orders
  ORDERS_READ = 'orders.read',
  ORDERS_CREATE = 'orders.create',
  ORDERS_UPDATE = 'orders.update',
  ORDERS_CANCEL = 'orders.cancel',
  ORDERS_ASSIGN_DRIVER = 'orders.assign_driver',
  ORDERS_VIEW_ALL = 'orders.view_all',
  ORDERS_REFUND = 'orders.refund',

  // Drivers
  DRIVERS_READ = 'drivers.read',
  DRIVERS_CREATE = 'drivers.create',
  DRIVERS_UPDATE = 'drivers.update',
  DRIVERS_SUSPEND = 'drivers.suspend',
  DRIVERS_APPROVE = 'drivers.approve',
  DRIVERS_ASSIGN = 'drivers.assign',
  DRIVERS_VIEW_EARNINGS = 'drivers.view_earnings',
  DRIVERS_VIEW_LOCATION = 'drivers.view_location',
  DRIVERS_VIEW_DOCUMENTS = 'drivers.view_documents',

  // Merchants
  MERCHANTS_READ = 'merchants.read',
  MERCHANTS_CREATE = 'merchants.create',
  MERCHANTS_UPDATE = 'merchants.update',
  MERCHANTS_SUSPEND = 'merchants.suspend',
  MERCHANTS_APPROVE = 'merchants.approve',
  MERCHANTS_VIEW_ORDERS = 'merchants.view_orders',
  MERCHANTS_VIEW_REVENUE = 'merchants.view_revenue',
  MERCHANTS_CONFIGURE_COMMISSION = 'merchants.configure_commission',

  // Customers
  CUSTOMERS_READ = 'customers.read',
  CUSTOMERS_CREATE = 'customers.create',
  CUSTOMERS_UPDATE = 'customers.update',
  CUSTOMERS_SUSPEND = 'customers.suspend',
  CUSTOMERS_VIEW_ORDERS = 'customers.view_orders',
  CUSTOMERS_VIEW_WALLET = 'customers.view_wallet',
  CUSTOMERS_VIEW_COMPLAINTS = 'customers.view_complaints',

  // Payments
  PAYMENTS_READ = 'payments.read',
  PAYMENTS_REFUND = 'payments.refund',
  PAYMENTS_PROCESS = 'payments.process',

  // Wallets
  WALLETS_READ = 'wallets.read',
  WALLETS_CREDIT = 'wallets.credit',
  WALLETS_DEBIT = 'wallets.debit',
  WALLETS_VIEW_TRANSACTIONS = 'wallets.view_transactions',

  // Analytics
  ANALYTICS_READ = 'analytics.read',
  ANALYTICS_EXPORT = 'analytics.export',

  // Settings
  SETTINGS_READ = 'settings.read',
  SETTINGS_UPDATE = 'settings.update',
  SETTINGS_MANAGE_ZONES = 'settings.manage_zones',
  SETTINGS_MANAGE_PROMOS = 'settings.manage_promos',
  SETTINGS_MANAGE_FEES = 'settings.manage_fees',

  // Support
  TICKETS_READ = 'tickets.read',
  TICKETS_CREATE = 'tickets.create',
  TICKETS_UPDATE = 'tickets.update',
  TICKETS_RESOLVE = 'tickets.resolve',
  TICKETS_ASSIGN = 'tickets.assign',

  // Chat
  CHAT_READ = 'chat.read',
  CHAT_SEND = 'chat.send',

  // Notifications
  NOTIFICATIONS_SEND = 'notifications.send',
  NOTIFICATIONS_BROADCAST = 'notifications.broadcast',
}

export const PERMISSION_GROUPS = {
  orders: [
    Permission.ORDERS_READ,
    Permission.ORDERS_CREATE,
    Permission.ORDERS_UPDATE,
    Permission.ORDERS_CANCEL,
    Permission.ORDERS_ASSIGN_DRIVER,
    Permission.ORDERS_VIEW_ALL,
    Permission.ORDERS_REFUND,
  ],
  drivers: [
    Permission.DRIVERS_READ,
    Permission.DRIVERS_CREATE,
    Permission.DRIVERS_UPDATE,
    Permission.DRIVERS_SUSPEND,
    Permission.DRIVERS_APPROVE,
    Permission.DRIVERS_ASSIGN,
    Permission.DRIVERS_VIEW_EARNINGS,
    Permission.DRIVERS_VIEW_LOCATION,
    Permission.DRIVERS_VIEW_DOCUMENTS,
  ],
  merchants: [
    Permission.MERCHANTS_READ,
    Permission.MERCHANTS_CREATE,
    Permission.MERCHANTS_UPDATE,
    Permission.MERCHANTS_SUSPEND,
    Permission.MERCHANTS_APPROVE,
    Permission.MERCHANTS_VIEW_ORDERS,
    Permission.MERCHANTS_VIEW_REVENUE,
    Permission.MERCHANTS_CONFIGURE_COMMISSION,
  ],
  customers: [
    Permission.CUSTOMERS_READ,
    Permission.CUSTOMERS_CREATE,
    Permission.CUSTOMERS_UPDATE,
    Permission.CUSTOMERS_SUSPEND,
    Permission.CUSTOMERS_VIEW_ORDERS,
    Permission.CUSTOMERS_VIEW_WALLET,
    Permission.CUSTOMERS_VIEW_COMPLAINTS,
  ],
  payments: [
    Permission.PAYMENTS_READ,
    Permission.PAYMENTS_REFUND,
    Permission.PAYMENTS_PROCESS,
  ],
  wallets: [
    Permission.WALLETS_READ,
    Permission.WALLETS_CREDIT,
    Permission.WALLETS_DEBIT,
    Permission.WALLETS_VIEW_TRANSACTIONS,
  ],
  analytics: [
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT,
  ],
  settings: [
    Permission.SETTINGS_READ,
    Permission.SETTINGS_UPDATE,
    Permission.SETTINGS_MANAGE_ZONES,
    Permission.SETTINGS_MANAGE_PROMOS,
    Permission.SETTINGS_MANAGE_FEES,
  ],
  support: [
    Permission.TICKETS_READ,
    Permission.TICKETS_CREATE,
    Permission.TICKETS_UPDATE,
    Permission.TICKETS_RESOLVE,
    Permission.TICKETS_ASSIGN,
  ],
  chat: [
    Permission.CHAT_READ,
    Permission.CHAT_SEND,
  ],
  notifications: [
    Permission.NOTIFICATIONS_SEND,
    Permission.NOTIFICATIONS_BROADCAST,
  ],
} as const;

export const ALL_PERMISSIONS = Object.values(Permission);

export function getPermissionLabel(permission: Permission): string {
  const labels: Record<Permission, string> = {
    [Permission.ORDERS_READ]: 'View Orders',
    [Permission.ORDERS_CREATE]: 'Create Orders',
    [Permission.ORDERS_UPDATE]: 'Update Orders',
    [Permission.ORDERS_CANCEL]: 'Cancel Orders',
    [Permission.ORDERS_ASSIGN_DRIVER]: 'Assign Driver to Orders',
    [Permission.ORDERS_VIEW_ALL]: 'View All Orders',
    [Permission.ORDERS_REFUND]: 'Refund Orders',
    [Permission.DRIVERS_READ]: 'View Drivers',
    [Permission.DRIVERS_CREATE]: 'Create Drivers',
    [Permission.DRIVERS_UPDATE]: 'Update Drivers',
    [Permission.DRIVERS_SUSPEND]: 'Suspend Drivers',
    [Permission.DRIVERS_APPROVE]: 'Approve Drivers',
    [Permission.DRIVERS_ASSIGN]: 'Assign Drivers',
    [Permission.DRIVERS_VIEW_EARNINGS]: 'View Driver Earnings',
    [Permission.DRIVERS_VIEW_LOCATION]: 'View Driver Location',
    [Permission.DRIVERS_VIEW_DOCUMENTS]: 'View Driver Documents',
    [Permission.MERCHANTS_READ]: 'View Merchants',
    [Permission.MERCHANTS_CREATE]: 'Create Merchants',
    [Permission.MERCHANTS_UPDATE]: 'Update Merchants',
    [Permission.MERCHANTS_SUSPEND]: 'Suspend Merchants',
    [Permission.MERCHANTS_APPROVE]: 'Approve Merchants',
    [Permission.MERCHANTS_VIEW_ORDERS]: 'View Merchant Orders',
    [Permission.MERCHANTS_VIEW_REVENUE]: 'View Merchant Revenue',
    [Permission.MERCHANTS_CONFIGURE_COMMISSION]: 'Configure Commission',
    [Permission.CUSTOMERS_READ]: 'View Customers',
    [Permission.CUSTOMERS_CREATE]: 'Create Customers',
    [Permission.CUSTOMERS_UPDATE]: 'Update Customers',
    [Permission.CUSTOMERS_SUSPEND]: 'Suspend Customers',
    [Permission.CUSTOMERS_VIEW_ORDERS]: 'View Customer Orders',
    [Permission.CUSTOMERS_VIEW_WALLET]: 'View Customer Wallet',
    [Permission.CUSTOMERS_VIEW_COMPLAINTS]: 'View Customer Complaints',
    [Permission.PAYMENTS_READ]: 'View Payments',
    [Permission.PAYMENTS_REFUND]: 'Refund Payments',
    [Permission.PAYMENTS_PROCESS]: 'Process Payments',
    [Permission.WALLETS_READ]: 'View Wallets',
    [Permission.WALLETS_CREDIT]: 'Credit Wallets',
    [Permission.WALLETS_DEBIT]: 'Debit Wallets',
    [Permission.WALLETS_VIEW_TRANSACTIONS]: 'View Wallet Transactions',
    [Permission.ANALYTICS_READ]: 'View Analytics',
    [Permission.ANALYTICS_EXPORT]: 'Export Analytics',
    [Permission.SETTINGS_READ]: 'View Settings',
    [Permission.SETTINGS_UPDATE]: 'Update Settings',
    [Permission.SETTINGS_MANAGE_ZONES]: 'Manage Zones',
    [Permission.SETTINGS_MANAGE_PROMOS]: 'Manage Promos',
    [Permission.SETTINGS_MANAGE_FEES]: 'Manage Fees',
    [Permission.TICKETS_READ]: 'View Tickets',
    [Permission.TICKETS_CREATE]: 'Create Tickets',
    [Permission.TICKETS_UPDATE]: 'Update Tickets',
    [Permission.TICKETS_RESOLVE]: 'Resolve Tickets',
    [Permission.TICKETS_ASSIGN]: 'Assign Tickets',
    [Permission.CHAT_READ]: 'Read Chat',
    [Permission.CHAT_SEND]: 'Send Chat',
    [Permission.NOTIFICATIONS_SEND]: 'Send Notifications',
    [Permission.NOTIFICATIONS_BROADCAST]: 'Broadcast Notifications',
  };
  return labels[permission] || permission;
}

export function getPermissionsByGroup(group: keyof typeof PERMISSION_GROUPS): Permission[] {
  return PERMISSION_GROUPS[group];
}

export function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
  const grouped: Record<string, Permission[]> = {};
  for (const permission of permissions) {
    for (const [group, perms] of Object.entries(PERMISSION_GROUPS)) {
      if (perms.includes(permission)) {
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(permission);
        break;
      }
    }
  }
  return grouped;
}