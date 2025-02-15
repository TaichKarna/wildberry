export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface App {
  id: string;
  name: string;
  bundleId: string;
  platform: 'ios' | 'android' | 'web';
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  appId: string;
  type: 'consumable' | 'non_consumable' | 'subscription';
  price: number;
  currency: string;
  trialPeriod?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Entitlement {
  id: string;
  name: string;
  appId: string;
  description?: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Offering {
  id: string;
  name: string;
  appId: string;
  description?: string;
  products: string[];
  entitlements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  type: 'public' | 'private';
  permissions: string[];
  createdAt: string;
  expiresAt?: string;
  lastUsed?: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface AuditLog {
  id: string;
  type: string;
  action: string;
  userId: string;
  resourceId?: string;
  resourceType?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
