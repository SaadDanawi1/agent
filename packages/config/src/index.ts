import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('api'),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default('*'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  // Lebanon Config
  LEBANON_PHONE_PREFIX: z.string().default('+961'),
  DEFAULT_CURRENCY: z.enum(['USD', 'LBP']).default('USD'),
  EXCHANGE_RATE_USD_TO_LBP: z.coerce.number().positive().default(89500),

  // SMS (Twilio)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Maps
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  MAPBOX_ACCESS_TOKEN: z.string().optional(),

  // Push Notifications
  FIREBASE_SERVER_KEY: z.string().optional(),
  FCM_SENDER_ID: z.string().optional(),

  // Storage (S3)
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
});

export const env = EnvSchema.parse(process.env);

export const LEBANON_CONFIG = {
  phonePrefix: env.LEBANON_PHONE_PREFIX,
  phoneRegex: /^\+961[0-9]{8}$/,
  currencies: ['USD', 'LBP'] as const,
  defaultCurrency: env.DEFAULT_CURRENCY,
  exchangeRate: env.EXCHANGE_RATE_USD_TO_LBP,
  zones: [
    'beirut',
    'mount_lebanon',
    'north',
    'south',
    'bekaa',
    'nabatieh',
  ],
} as const;

export const AUTH_CONFIG = {
  otpLength: 6,
  otpTtlMinutes: 5,
  maxOtpAttempts: 3,
  otpRateLimit: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
  },
  passwordMinLength: 8,
  loginRateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
  sessionLimit: 3,
  refreshTokenTtlDays: 30,
  accessTokenTtlMinutes: 15,
} as const;

export const APP_CONFIG = {
  name: 'Delivery App',
  version: '1.0.0',
  apiPrefix: env.API_PREFIX,
  port: env.PORT,
  corsOrigin: env.CORS_ORIGIN.split(','),
  nodeEnv: env.NODE_ENV,
} as const;

export const DATABASE_CONFIG = {
  url: env.DATABASE_URL,
  poolSize: 10,
} as const;

export const REDIS_CONFIG = {
  url: env.REDIS_URL,
} as const;

export const JWT_CONFIG = {
  secret: env.JWT_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  accessTtl: env.JWT_ACCESS_TTL,
  refreshTtl: env.JWT_REFRESH_TTL,
} as const;

export const SMS_CONFIG = {
  provider: 'twilio',
  accountSid: env.TWILIO_ACCOUNT_SID,
  authToken: env.TWILIO_AUTH_TOKEN,
  fromNumber: env.TWILIO_PHONE_NUMBER,
} as const;

export const MAPS_CONFIG = {
  googleApiKey: env.GOOGLE_MAPS_API_KEY,
  mapboxToken: env.MAPBOX_ACCESS_TOKEN,
  defaultProvider: 'google' as const,
} as const;

export const PUSH_CONFIG = {
  firebaseServerKey: env.FIREBASE_SERVER_KEY,
  fcmSenderId: env.FCM_SENDER_ID,
} as const;

export const STORAGE_CONFIG = {
  endpoint: env.S3_ENDPOINT,
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_KEY,
  bucket: env.S3_BUCKET,
  region: env.S3_REGION,
} as const;

export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}