import { z } from 'zod';
import { format, parseISO, isValid, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Currency formatting
export const LEBANON_EXCHANGE_RATE = 89500;

export function formatUSD(amount: number, locale: 'en' | 'ar' = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-LB' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatLBP(amount: number, locale: 'en' | 'ar' = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-LB' : 'en-US', {
    style: 'currency',
    currency: 'LBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrency(
  amountUsd: number,
  amountLbp: number,
  preferredCurrency: 'USD' | 'LBP' = 'USD',
  locale: 'en' | 'ar' = 'en'
): string {
  if (preferredCurrency === 'USD') {
    return formatUSD(amountUsd, locale);
  }
  return formatLBP(amountLbp, locale);
}

export function convertUSDtoLBP(usd: number, rate: number = LEBANON_EXCHANGE_RATE): number {
  return Math.round(usd * rate);
}

export function convertLBPtoUSD(lbp: number, rate: number = LEBANON_EXCHANGE_RATE): number {
  return Math.round((lbp / rate) * 100) / 100;
}

// Phone formatting
export const LEBANON_PHONE_REGEX = /^\+961[0-9]{8}$/;

export function formatLebanonPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('961')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '+961' + cleaned.slice(1);
  }
  if (cleaned.length === 8) {
    return '+961' + cleaned;
  }
  return phone;
}

export function validateLebanonPhone(phone: string): boolean {
  return LEBANON_PHONE_REGEX.test(formatLebanonPhone(phone));
}

// Date formatting
export function formatDate(date: Date | string, locale: 'en' | 'ar' = 'en', pattern: string = 'PP'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, pattern, { locale: locale === 'ar' ? ar : enUS });
}

export function formatTime(date: Date | string, locale: 'en' | 'ar' = 'en'): string {
  return formatDate(date, locale, 'p');
}

export function formatDateTime(date: Date | string, locale: 'en' | 'ar' = 'en'): string {
  return formatDate(date, locale, 'PPp');
}

export function formatRelativeTime(date: Date | string, locale: 'en' | 'ar' = 'en'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, d);
  
  if (diffMinutes < 1) return locale === 'ar' ? 'الآن' : 'Just now';
  if (diffMinutes < 60) return locale === 'ar' ? `منذ ${diffMinutes} دقيقة` : `${diffMinutes}m ago`;
  
  const diffHours = differenceInHours(now, d);
  if (diffHours < 24) return locale === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
  
  const diffDays = differenceInDays(now, d);
  if (diffDays < 7) return locale === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  
  return formatDate(d, locale, 'PP');
}

// Address formatting
export interface AddressComponents {
  street?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  area?: string;
  city?: string;
}

export function formatAddress(components: AddressComponents, locale: 'en' | 'ar' = 'en'): string {
  const parts: string[] = [];
  
  if (components.street) parts.push(components.street);
  if (components.building) parts.push(locale === 'ar' ? `مبنى ${components.building}` : `Building ${components.building}`);
  if (components.floor) parts.push(locale === 'ar' ? `طابق ${components.floor}` : `Floor ${components.floor}`);
  if (components.apartment) parts.push(locale === 'ar' ? `شقة ${components.apartment}` : `Apt ${components.apartment}`);
  if (components.landmark) parts.push(locale === 'ar' ? `قرب ${components.landmark}` : `Near ${components.landmark}`);
  if (components.area) parts.push(components.area);
  if (components.city) parts.push(components.city);
  
  return parts.join(', ');
}

// Validation schemas
export const phoneSchema = z.string().regex(LEBANON_PHONE_REGEX, 'Invalid Lebanon phone number');

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*]/, 'Password must contain at least one special character');

export const otpSchema = z.string().regex(/^\d{6}$/, 'OTP must be 6 digits');

export const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const addressSchema = z.object({
  label: z.enum(['HOME', 'WORK', 'OTHER']).optional(),
  street: z.string().min(1),
  building: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  landmark: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  zoneId: z.string().uuid().optional(),
  isDefault: z.boolean().optional(),
});

// Distance calculation (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ETA calculation
export function calculateETA(
  distanceKm: number,
  avgSpeedKmh: number = 30
): number {
  return Math.ceil((distanceKm / avgSpeedKmh) * 60); // minutes
}

// Generate order number
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = format(date, 'yyyyMMdd');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${dateStr}-${random}`;
}

// Generate tracking number
export function generateTrackingNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TRK-';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Deep clone
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Object utilities
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// String utilities
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}