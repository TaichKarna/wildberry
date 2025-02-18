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

export interface LoginRequest {
    username: string;
    password: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface ApiKeyResponse {
    id: string;
    key: string;
    name: string;
    type: 'public' | 'private';
    permissions: string[];
    createdAt: string;
    expiresAt?: string;
    lastUsed?: string;
    status: 'active' | 'expired' | 'revoked';
}

export interface CreateApiKeyRequest {
    name: string;
    appId: string;
    permissions: string[];
    expiresIn?: string;
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

export interface PaginationQuery {
    page?: number;
    limit?: number;
    search?: string;
}

export interface DateRangeQuery {
    startDate: string;
    endDate: string;
    appId?: string;
}

export interface AnalyticsQuery extends DateRangeQuery {
    interval?: 'day' | 'week' | 'month';
}

export type ApiKeyPermission =
    | 'read:products'
    | 'write:products'
    | 'read:offerings'
    | 'write:offerings'
    | 'read:entitlements'
    | 'write:entitlements'
    | 'verify:purchases'
    | 'manage:subscriptions'
    | 'manage:api_keys'
    | 'read:analytics'
    | 'read:audit_logs'
    | 'manage:webhooks'
    | 'manage:settings';
