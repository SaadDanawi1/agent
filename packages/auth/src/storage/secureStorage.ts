import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth.access_token',
  REFRESH_TOKEN: 'auth.refresh_token',
  USER_DATA: 'auth.user_data',
  DEVICE_ID: 'auth.device_id',
} as const;

export async function storeTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken, {
      keychainService: 'delivery-app',
      keychainAccessible: Platform.OS === 'ios' 
        ? SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY 
        : undefined,
    }),
    SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, {
      keychainService: 'delivery-app',
      keychainAccessible: Platform.OS === 'ios' 
        ? SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY 
        : undefined,
    }),
  ]);
}

export async function getTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
    SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
  ]);

  return { accessToken, refreshToken };
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
  ]);
}

export async function storeUserData(userData: object): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData), {
    keychainService: 'delivery-app',
  });
}

export async function getUserData(): Promise<object | null> {
  const data = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function clearUserData(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
}

export async function getDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_ID, deviceId, {
      keychainService: 'delivery-app',
    });
  }
  return deviceId;
}

export async function clearAllAuthData(): Promise<void> {
  await Promise.all([
    clearTokens(),
    clearUserData(),
  ]);
}