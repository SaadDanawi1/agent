import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getTokens, storeTokens, clearTokens } from '@delivery/auth/storage/secureStorage';
import { refreshAccessToken } from '@delivery/auth/utils/tokenUtils';
import { AuthTokens } from './contracts';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const { accessToken } = await getTokens();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        // Add device ID header
        const deviceId = await this.getDeviceId();
        config.headers['X-Device-ID'] = deviceId;
        
        // Add request ID for tracing
        config.headers['X-Request-ID'] = crypto.randomUUID();
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const { refreshToken } = await getTokens();
            if (!refreshToken) throw new Error('No refresh token');

            const newTokens = await this.refreshToken(refreshToken);
            await storeTokens(newTokens.accessToken, newTokens.refreshToken);

            // Process queued requests
            this.failedQueue.forEach(({ resolve }) => resolve(newTokens.accessToken));
            this.failedQueue = [];

            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            await clearTokens();
            // Redirect to login would be handled by auth context
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async getDeviceId(): Promise<string> {
    // This would come from secure storage
    return 'device-id-placeholder';
  }

  private async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await axios.post(`${this.client.defaults.baseURL}/auth/refresh`, {
      refreshToken,
    });
    return response.data;
  }

  // HTTP methods
  get<T>(url: string, params?: any) {
    return this.client.get<T>(url, { params });
  }

  post<T>(url: string, data?: any) {
    return this.client.post<T>(url, data);
  }

  patch<T>(url: string, data?: any) {
    return this.client.patch<T>(url, data);
  }

  put<T>(url: string, data?: any) {
    return this.client.put<T>(url, data);
  }

  delete<T>(url: string) {
    return this.client.delete<T>(url);
  }

  // Auth endpoints
  auth = {
    sendOtp: (phone: string, method?: 'SMS' | 'WHATSAPP') =>
      this.post('/auth/send-otp', { phone, method }),
    verifyOtp: (phone: string, otp: string, deviceInfo?: any) =>
      this.post('/auth/verify-otp', { phone, otp, deviceInfo }),
    login: (email: string, password: string, deviceInfo?: any) =>
      this.post('/auth/login', { email, password, deviceInfo }),
    refresh: (refreshToken: string) =>
      this.post('/auth/refresh', { refreshToken }),
    logout: (refreshToken: string) =>
      this.post('/auth/logout', { refreshToken }),
    me: () =>
      this.get('/auth/me'),
    switchRole: (role: string) =>
      this.post('/auth/switch-role', { role }),
  };

  // Orders endpoints
  orders = {
    list: (params?: any) =>
      this.get('/orders', params),
    create: (data: any) =>
      this.post('/orders', data),
    get: (id: string) =>
      this.get(`/orders/${id}`),
    update: (id: string, data: any) =>
      this.patch(`/orders/${id}`, data),
    updateStatus: (id: string, status: string, metadata?: any) =>
      this.patch(`/orders/${id}/status`, { status, metadata }),
    assignDriver: (id: string, driverId: string) =>
      this.post(`/orders/${id}/assign-driver`, { driverId }),
    refund: (id: string, data: any) =>
      this.post(`/orders/${id}/refund`, data),
    getHistory: (id: string) =>
      this.get(`/orders/${id}/history`),
    getValidTransitions: (id: string) =>
      this.get(`/orders/${id}/valid-transitions`),
  };

  // Drivers endpoints
  drivers = {
    list: (params?: any) =>
      this.get('/drivers', params),
    get: (id: string) =>
      this.get(`/drivers/${id}`),
    updateStatus: (id: string, status: string) =>
      this.patch(`/drivers/${id}/status`, { status }),
    updateLocation: (latitude: number, longitude: number) =>
      this.patch('/drivers/me/location', { latitude, longitude }),
    getEarnings: (params?: any) =>
      this.get('/drivers/me/earnings', params),
    getPayouts: (params?: any) =>
      this.get('/drivers/me/payouts', params),
  };

  // Merchants endpoints
  merchants = {
    list: (params?: any) =>
      this.get('/merchants', params),
    get: (id: string) =>
      this.get(`/merchants/${id}`),
    create: (data: any) =>
      this.post('/merchants', data),
    update: (id: string, data: any) =>
      this.patch(`/merchants/${id}`, data),
    getOrders: (id: string, params?: any) =>
      this.get(`/merchants/${id}/orders`, params),
    getRevenue: (id: string, params?: any) =>
      this.get(`/merchants/${id}/revenue`, params),
    updateMenu: (id: string, data: any) =>
      this.patch(`/merchants/${id}/menu`, data),
  };

  // Customers endpoints
  customers = {
    getProfile: () =>
      this.get('/customers/me'),
    updateProfile: (data: any) =>
      this.patch('/customers/me', data),
    getAddresses: () =>
      this.get('/customers/me/addresses'),
    addAddress: (data: any) =>
      this.post('/customers/me/addresses', data),
    updateAddress: (id: string, data: any) =>
      this.patch(`/customers/me/addresses/${id}`, data),
    deleteAddress: (id: string) =>
      this.delete(`/customers/me/addresses/${id}`),
    getWallet: () =>
      this.get('/customers/me/wallet'),
    getOrders: (params?: any) =>
      this.get('/customers/me/orders', params),
  };

  // Wallet endpoints
  wallet = {
    getBalance: () =>
      this.get('/wallet/me'),
    getTransactions: (params?: any) =>
      this.get('/wallet/me/transactions', params),
    addFunds: (amount: number, paymentMethodId: string) =>
      this.post('/wallet/me/topup', { amount, paymentMethodId }),
  };

  // Notifications
  notifications = {
    list: (params?: any) =>
      this.get('/notifications', params),
    markAsRead: (id: string) =>
      this.patch(`/notifications/${id}/read`),
    markAllAsRead: () =>
      this.patch('/notifications/read-all'),
  };

  // Chat
  chat = {
    getSessions: () =>
      this.get('/chat/sessions'),
    getMessages: (sessionId: string) =>
      this.get(`/chat/sessions/${sessionId}/messages`),
    sendMessage: (sessionId: string, message: string, type?: string) =>
      this.post(`/chat/sessions/${sessionId}/messages`, { message, type }),
  };

  // Support
  support = {
    createTicket: (data: any) =>
      this.post('/support/tickets', data),
    getTickets: (params?: any) =>
      this.get('/support/tickets', params),
    getTicket: (id: string) =>
      this.get(`/support/tickets/${id}`),
    addMessage: (ticketId: string, message: string) =>
      this.post(`/support/tickets/${ticketId}/messages`, { message }),
  };
}

export const api = new ApiClient();