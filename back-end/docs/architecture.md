# Architecture Documentation

## Overview

The Wildberry backend is built using a modular architecture that emphasizes separation of concerns, maintainability, and scalability. This document outlines the core architectural components and their interactions.

## Directory Structure

```
src/
├── modules/           # Feature modules
├── middleware/        # Express middleware
├── models/           # Database models
├── services/         # Shared services
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
└── config/           # Configuration files
```

## Modules

Each feature module is self-contained and follows a consistent structure:

```
modules/
├── auth/
│   ├── routes.ts
│   ├── controller.ts
│   ├── service.ts
│   └── validation.ts
├── apps/
├── products/
├── entitlements/
├── offerings/
├── api-keys/
├── analytics/
└── audit-logs/
```

### Auth Module

Handles authentication and authorization.

**Components:**
- JWT token management
- API key validation
- Permission checks
- Session handling

**Key Files:**
```typescript
// auth/service.ts
class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthToken>
  async refreshToken(token: string): Promise<AuthToken>
  async validateApiKey(key: string): Promise<ApiKeyInfo>
}

// auth/controller.ts
class AuthController {
  async login(req: Request, res: Response)
  async refresh(req: Request, res: Response)
  async logout(req: Request, res: Response)
}
```

### Apps Module

Manages application registration and configuration.

**Components:**
- App registration
- Platform configuration
- App settings management

**Key Files:**
```typescript
// apps/service.ts
class AppService {
  async createApp(data: CreateAppDTO): Promise<App>
  async updateApp(id: string, data: UpdateAppDTO): Promise<App>
  async getAppSettings(id: string): Promise<AppSettings>
}
```

### Products Module

Handles product and pricing management.

**Components:**
- Product creation and management
- Price configuration
- Product metadata

**Key Files:**
```typescript
// products/service.ts
class ProductService {
  async createProduct(data: CreateProductDTO): Promise<Product>
  async updatePricing(id: string, pricing: PricingInfo): Promise<Product>
  async getProductMetadata(id: string): Promise<ProductMetadata>
}
```

### Entitlements Module

Manages feature access control.

**Components:**
- Feature flags
- Access control
- Entitlement inheritance

**Key Files:**
```typescript
// entitlements/service.ts
class EntitlementService {
  async createEntitlement(data: CreateEntitlementDTO): Promise<Entitlement>
  async checkAccess(userId: string, feature: string): Promise<boolean>
  async inheritFeatures(sourceId: string, targetId: string): Promise<void>
}
```

### Offerings Module

Handles product bundling and presentation.

**Components:**
- Bundle configuration
- A/B testing
- Offering presentation

**Key Files:**
```typescript
// offerings/service.ts
class OfferingService {
  async createOffering(data: CreateOfferingDTO): Promise<Offering>
  async getActiveOfferings(appId: string): Promise<Offering[]>
  async configureABTest(data: ABTestConfig): Promise<void>
}
```

## Middleware

### Authentication Middleware

```typescript
// middleware/auth.middleware.ts
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  // JWT validation logic
}

export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  // API key validation logic
}
```

### Rate Limiting

```typescript
// middleware/rate-limit.middleware.ts
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### Error Handling

```typescript
// middleware/error.middleware.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Error handling logic
}
```

### Request Validation

```typescript
// middleware/validation.middleware.ts
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Request validation logic
  }
}
```

## Models

### Database Models

```typescript
// models/app.model.ts
interface App {
  id: string;
  name: string;
  bundleId: string;
  platform: Platform;
  settings: AppSettings;
  createdAt: Date;
  updatedAt: Date;
}

// models/product.model.ts
interface Product {
  id: string;
  appId: string;
  name: string;
  type: ProductType;
  price: number;
  currency: string;
  metadata: ProductMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// models/entitlement.model.ts
interface Entitlement {
  id: string;
  appId: string;
  name: string;
  features: string[];
  inheritance: InheritanceConfig;
  createdAt: Date;
  updatedAt: Date;
}
```

### Data Access Layer

```typescript
// models/base.repository.ts
class BaseRepository<T> {
  async findById(id: string): Promise<T>
  async create(data: Partial<T>): Promise<T>
  async update(id: string, data: Partial<T>): Promise<T>
  async delete(id: string): Promise<void>
}
```

## Services

### Database Service

```typescript
// services/database.service.ts
class DatabaseService {
  async connect(): Promise<void>
  async disconnect(): Promise<void>
  async transaction<T>(fn: (trx: Transaction) => Promise<T>): Promise<T>
}
```

### Cache Service

```typescript
// services/cache.service.ts
class CacheService {
  async get<T>(key: string): Promise<T | null>
  async set<T>(key: string, value: T, ttl?: number): Promise<void>
  async delete(key: string): Promise<void>
}
```

### Logger Service

```typescript
// services/logger.service.ts
class LoggerService {
  info(message: string, context?: object): void
  error(message: string, error?: Error, context?: object): void
  warn(message: string, context?: object): void
  debug(message: string, context?: object): void
}
```

## Configuration

### Environment Variables

```typescript
// config/env.ts
export const config = {
  app: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h'
  }
};
```

### Constants

```typescript
// config/constants.ts
export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000,
  MAX_REQUESTS: 100
};

export const CACHE_TTL = {
  PRODUCT: 3600,
  OFFERING: 1800,
  APP_SETTINGS: 300
};
```

## Error Handling

### Custom Error Classes

```typescript
// utils/errors.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: object
  ) {
    super(message);
  }
}

export class ValidationError extends ApiError {
  constructor(details: object) {
    super('VALIDATION_ERROR', 'Validation failed', details);
  }
}
```

## Testing Strategy

### Unit Tests

- Test individual components in isolation
- Mock external dependencies
- Focus on business logic

### Integration Tests

- Test component interactions
- Use test database
- Verify API contracts

### E2E Tests

- Test complete user flows
- Simulate real-world scenarios
- Verify system behavior

## Security

### Authentication

- JWT-based authentication
- API key authentication
- Role-based access control

### Data Protection

- Input validation
- SQL injection prevention
- XSS protection

### Audit Logging

- Track all sensitive operations
- Log security events
- Maintain audit trail

## Performance

### Caching Strategy

- Redis for distributed caching
- In-memory caching for frequently accessed data
- Cache invalidation patterns

### Database Optimization

- Indexing strategy
- Query optimization
- Connection pooling

### Rate Limiting

- API rate limiting
- DDoS protection
- Resource usage limits
