// Placeholder screens for each role - to be implemented

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from '@delivery/i18n';
import { useThemeColors, useThemeTypography, useThemeSpacing } from '../theme/ThemeContext';

function createPlaceholderScreen(role: string, screenName: string) {
  return function PlaceholderScreen() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const spacing = useThemeSpacing();

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t(screenName) || screenName}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {role} - {screenName} screen (to be implemented)
        </Text>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

// Customer screens
export const HomeScreen = createPlaceholderScreen('Customer', 'home');
export const OrdersScreen = createPlaceholderScreen('Customer', 'orders');
export const WalletScreen = createPlaceholderScreen('Customer', 'wallet');
export const ProfileScreen = createPlaceholderScreen('Customer', 'profile');

// Driver screens
export const DashboardScreen = createPlaceholderScreen('Driver', 'dashboard');
export const DeliveriesScreen = createPlaceholderScreen('Driver', 'deliveries');
export const MapScreen = createPlaceholderScreen('Driver', 'map');
export const DriverProfileScreen = createPlaceholderScreen('Driver', 'profile');

// Merchant screens
export const MerchantDashboardScreen = createPlaceholderScreen('Merchant', 'dashboard');
export const MerchantOrdersScreen = createPlaceholderScreen('Merchant', 'orders');
export const MenuScreen = createPlaceholderScreen('Merchant', 'menu');
export const SettingsScreen = createPlaceholderScreen('Merchant', 'settings');
export const MerchantProfileScreen = createPlaceholderScreen('Merchant', 'profile');

// Admin screens
export const AdminDashboardScreen = createPlaceholderScreen('Admin', 'dashboard');
export const AdminOrdersScreen = createPlaceholderScreen('Admin', 'orders');
export const AdminDriversScreen = createPlaceholderScreen('Admin', 'drivers');
export const AdminMerchantsScreen = createPlaceholderScreen('Admin', 'merchants');
export const AdminCustomersScreen = createPlaceholderScreen('Admin', 'customers');
export const AdminOperationsScreen = createPlaceholderScreen('Admin', 'operations');
export const AdminFinanceScreen = createPlaceholderScreen('Admin', 'finance');
export const AdminSupportScreen = createPlaceholderScreen('Admin', 'support');
export const AdminAnalyticsScreen = createPlaceholderScreen('Admin', 'analytics');
export const AdminSettingsScreen = createPlaceholderScreen('Admin', 'settings');

// Operations screens
export const LiveBoardScreen = createPlaceholderScreen('Operations', 'liveBoard');
export const OperationsOrdersScreen = createPlaceholderScreen('Operations', 'orders');
export const OperationsDriversScreen = createPlaceholderScreen('Operations', 'drivers');
export const OperationsMerchantsScreen = createPlaceholderScreen('Operations', 'merchants');
export const IncidentsScreen = createPlaceholderScreen('Operations', 'incidents');

// Support screens
export const TicketsScreen = createPlaceholderScreen('Support', 'tickets');
export const SupportCustomersScreen = createPlaceholderScreen('Support', 'customers');
export const SupportDriversScreen = createPlaceholderScreen('Support', 'drivers');
export const SupportMerchantsScreen = createPlaceholderScreen('Support', 'merchants');
export const KnowledgeBaseScreen = createPlaceholderScreen('Support', 'knowledgeBase');

// Finance screens
export const RevenueScreen = createPlaceholderScreen('Finance', 'revenue');
export const CommissionsScreen = createPlaceholderScreen('Finance', 'commissions');
export const DriverPayoutsScreen = createPlaceholderScreen('Finance', 'driverPayouts');
export const MerchantPayoutsScreen = createPlaceholderScreen('Finance', 'merchantPayouts');
export const TransactionsScreen = createPlaceholderScreen('Finance', 'transactions');