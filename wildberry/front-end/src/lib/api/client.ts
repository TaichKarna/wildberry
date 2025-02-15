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
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('refreshToken');
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new ApiError('AUTH_ERROR', 'No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        throw new ApiError('AUTH_ERROR', 'Failed to refresh token');
      }

      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken);
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        if (!this.refreshPromise) {
          this.refreshPromise = this.refreshAccessToken();
        }

        await this.refreshPromise;
        this.refreshPromise = null;

        // Retry the original request
        return this.fetch(endpoint, options);
      }

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
    const response = await this.fetch<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );

    if (response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async logout() {
    await this.fetch('/auth/logout', { method: 'POST' });
    this.clearTokens();
  }

  // Apps endpoints
  async getApps(params?: { page?: number; limit?: number; search?: string }) {
    return this.fetch('/admin/apps', {
      method: 'GET',
      ...(params && {
        body: JSON.stringify(params),
      }),
    });
  }

  async createApp(data: {
    name: string;
    bundleId: string;
    platform: 'ios' | 'android' | 'web';
    description?: string;
  }) {
    return this.fetch('/admin/apps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Products endpoints
  async getProducts(params?: { page?: number; limit?: number; appId?: string }) {
    return this.fetch('/admin/products', {
      method: 'GET',
      ...(params && {
        body: JSON.stringify(params),
      }),
    });
  }

  // API Keys endpoints
  async createApiKey(data: {
    name: string;
    type: 'public' | 'private';
    permissions: string[];
    expiresIn?: string;
  }) {
    return this.fetch(`/admin/api-keys/${data.type}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async revokeApiKey(keyId: string) {
    return this.fetch(`/admin/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getAnalytics(params: {
    startDate: string;
    endDate: string;
    appId?: string;
  }) {
    return this.fetch('/admin/analytics/overview', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
