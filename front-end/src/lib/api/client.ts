import { ApiResponse } from './types';

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1') {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Send cookies with requests
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error?.code || 'UNKNOWN_ERROR',
          data.error?.message || 'An unknown error occurred',
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('NETWORK_ERROR', 'Network request failed');
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    return this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.fetch('/auth/logout', { method: 'POST' });
  }

  // Apps endpoints
  async getApps(params?: { page?: number; limit?: number; search?: string }) {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return this.fetch(`/apps${query ? `?${query}` : ''}`, { method: 'GET' });
  }

  async createApp(data: {
    name: string;
    bundleId: string;
    platform: 'ios' | 'android' | 'web';
    description?: string;
  }) {
    return this.fetch('/apps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Products endpoints
  async getProducts(params?: { page?: number; limit?: number; appId?: string }) {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return this.fetch(`/products${query ? `?${query}` : ''}`, { method: 'GET' });
  }

  async createProduct(data: { 
    name: string; 
    appId: string; 
    type: 'subscription' | 'one_time'; 
    price: number; 
    currency: string; 
    interval?: string; 
    description?: string 
  }) {
    return this.fetch('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Entitlements endpoints
  async getEntitlements(params?: { page?: number; limit?: number; appId?: string }) {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return this.fetch(`/entitlements${query ? `?${query}` : ''}`, { method: 'GET' });
  }

  async createEntitlement(data: { 
    name: string; 
    appId: string; 
    description?: string; 
    features: string[] 
  }) {
    return this.fetch('/entitlements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Offerings endpoints
  async getOfferings(params?: { page?: number; limit?: number; appId?: string }) {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return this.fetch(`/offerings${query ? `?${query}` : ''}`, { method: 'GET' });
  }

  async createOffering(data: { 
    name: string; 
    appId: string; 
    description?: string; 
    products: string[]; 
    entitlements: string[] 
  }) {
    return this.fetch('/offerings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // API Keys endpoints
  async createApiKey(data: {
    name: string;
    type: 'public' | 'private';
    permissions: string[];
    expiresIn?: string;
  }) {
    return this.fetch(`/api-keys/${data.type}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async revokeApiKey(keyId: string) {
    return this.fetch(`/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getAnalytics(params: {
    startDate: string;
    endDate: string;
    appId?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.fetch(`/analytics/overview?${query}`, { method: 'GET' });
  }

  async getRecentSales(params?: { limit?: number }) {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return this.fetch(`/analytics/recent-sales${query ? `?${query}` : ''}`, { method: 'GET' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
