# API Endpoints Documentation

## Base URL
```
/api/v1
```

## Authentication
### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

### Logout
```http
POST /auth/logout
```

### Admin Authentication (Dashboard Access)
All dashboard endpoints require a valid JWT token obtained through admin login.

```http
POST /auth/login
Content-Type: application/json

Request:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "accessToken": "string", // JWT token
  "refreshToken": "string",
  "expiresIn": number // seconds
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "string"
}

Response:
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": number
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

## Authentication Headers

### Dashboard Endpoints
All dashboard endpoints require the JWT token in the Authorization header:
```http
Authorization: Bearer <jwt_token>
```

### API Client Authentication
For external API access (not dashboard), use API keys:
```http
# For private API requests
Authorization: Bearer priv_<your_private_key>

# For public API requests
Authorization: Bearer pub_<your_public_key>
```

## Security Measures

### JWT Token
- Short lived (1 hour)
- Contains user permissions and role
- Must be renewed using refresh token
- Invalidated on logout

### Session Management
- One active session per admin user
- Force logout other sessions on new login
- Audit logging for all authentication events

## Apps
### List Apps
```http
GET /apps
Query Parameters:
  - page: number
  - limit: number
  - search: string?
```

### Create App
```http
POST /apps
Content-Type: application/json

{
  "name": "string",
  "bundleId": "string",
  "platform": "ios|android|web",
  "description": "string?"
}
```

### Get App Details
```http
GET /apps/{appId}
```

### Update App
```http
PUT /apps/{appId}
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "status": "active|inactive"
}
```

### Delete App
```http
DELETE /apps/{appId}
```

## Products
### List Products
```http
GET /products
Query Parameters:
  - page: number
  - limit: number
  - appId: string?
```

### Create Product
```http
POST /products
Content-Type: application/json

{
  "name": "string",
  "appId": "string",
  "type": "consumable|non_consumable|subscription",
  "price": number,
  "currency": "string",
  "trialPeriod": "string?",
  "description": "string?"
}
```

### Get Product Details
```http
GET /products/{productId}
```

### Update Product
```http
PUT /products/{productId}
Content-Type: application/json

{
  "name": "string",
  "price": number,
  "status": "active|inactive",
  "description": "string"
}
```

### Delete Product
```http
DELETE /products/{productId}
```

## Entitlements
### List Entitlements
```http
GET /entitlements
Query Parameters:
  - page: number
  - limit: number
  - appId: string?
```

### Create Entitlement
```http
POST /entitlements
Content-Type: application/json

{
  "name": "string",
  "appId": "string",
  "description": "string?",
  "features": string[]
}
```

### Get Entitlement Details
```http
GET /entitlements/{entitlementId}
```

### Update Entitlement
```http
PUT /entitlements/{entitlementId}
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "features": string[]
}
```

### Delete Entitlement
```http
DELETE /entitlements/{entitlementId}
```

## Offerings
### List Offerings
```http
GET /offerings
Query Parameters:
  - page: number
  - limit: number
  - appId: string?
```

### Create Offering
```http
POST /offerings
Content-Type: application/json

{
  "name": "string",
  "appId": "string",
  "description": "string?",
  "products": string[],
  "entitlements": string[]
}
```

### Get Offering Details
```http
GET /offerings/{offeringId}
```

### Update Offering
```http
PUT /offerings/{offeringId}
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "products": string[],
  "entitlements": string[]
}
```

### Delete Offering
```http
DELETE /offerings/{offeringId}
```

## API Keys
### Authentication
All API requests must include one of the following headers:
```http
# For private API requests
Authorization: Bearer priv_<your_private_key>

# For public API requests
Authorization: Bearer pub_<your_public_key>
```

### List API Keys
```http
GET /api-keys
Query Parameters:
  - page: number
  - limit: number
  - appId: string?
  - type: "public"|"private"
```

### Create Public API Key
```http
POST /api-keys/public
Content-Type: application/json

{
  "name": "string",
  "appId": "string",
  "permissions": [
    "read:products",
    "read:offerings",
    "read:entitlements"
  ],
  "expiresIn": "string?" // e.g., "30d", "1y", null for no expiration
}

Response:
{
  "id": "string",
  "key": "pub_xxxxxx", // Only shown once upon creation
  "name": "string",
  "permissions": string[],
  "createdAt": "string",
  "expiresAt": "string?"
}
```

### Create Private API Key
```http
POST /api-keys/private
Content-Type: application/json

{
  "name": "string",
  "appId": "string",
  "permissions": [
    "read:products",
    "write:products",
    "read:offerings",
    "write:offerings",
    "read:entitlements",
    "write:entitlements",
    "read:analytics",
    "manage:api_keys"
  ],
  "expiresIn": "string?" // e.g., "30d", "1y", null for no expiration
}

Response:
{
  "id": "string",
  "key": "priv_xxxxxx", // Only shown once upon creation
  "name": "string",
  "permissions": string[],
  "createdAt": "string",
  "expiresAt": "string?"
}
```

### Get API Key Details
```http
GET /api-keys/{keyId}

Response:
{
  "id": "string",
  "name": "string",
  "type": "public"|"private",
  "permissions": string[],
  "createdAt": "string",
  "expiresAt": "string?",
  "lastUsed": "string?",
  "status": "active"|"expired"|"revoked"
}
```

### Update API Key
```http
PATCH /api-keys/{keyId}
Content-Type: application/json

{
  "name": "string?",
  "permissions": string[]?,
  "status": "active"|"revoked"?
}
```

### Revoke API Key
```http
DELETE /api-keys/{keyId}
```

### Rotate API Key
```http
POST /api-keys/{keyId}/rotate

Response:
{
  "id": "string",
  "key": "pub_xxxxxx"|"priv_xxxxxx", // New key
  "name": "string",
  "type": "public"|"private",
  "permissions": string[],
  "createdAt": "string",
  "expiresAt": "string?"
}
```

## API Key Permissions
### Public Key Permissions
- `read:products` - View product information
- `read:offerings` - View offering information
- `read:entitlements` - View entitlement information
- `verify:purchases` - Verify purchase receipts
- `manage:subscriptions` - Manage user subscriptions

### Private Key Permissions
- All public permissions, plus:
- `write:products` - Create/update products
- `write:offerings` - Create/update offerings
- `write:entitlements` - Create/update entitlements
- `manage:api_keys` - Create/revoke API keys
- `read:analytics` - Access analytics data
- `read:audit_logs` - Access audit logs
- `manage:webhooks` - Configure webhooks
- `manage:settings` - Modify app settings

## API Key Best Practices
1. **Public Keys**
   - Use in client-side applications
   - Limited to read operations and purchase verification
   - Can be safely exposed in mobile/web apps
   - Should have minimal permissions

2. **Private Keys**
   - Never expose in client-side code
   - Use only in server-to-server communication
   - Store securely in environment variables
   - Rotate periodically (recommended every 90 days)

3. **Security Guidelines**
   - Set appropriate expiration dates
   - Use the minimum required permissions
   - Monitor key usage in audit logs
   - Revoke unused or compromised keys immediately
   - Implement IP whitelisting for private keys

## Protected Dashboard Endpoints

All the following endpoints require a valid JWT token:

### Apps Management
```http
GET /admin/apps
Authorization: Bearer <jwt_token>
```

### Products Management
```http
GET /admin/products
Authorization: Bearer <jwt_token>
```

### Entitlements Management
```http
GET /admin/entitlements
Authorization: Bearer <jwt_token>
```

### API Keys Management
```http
GET /admin/api-keys
Authorization: Bearer <jwt_token>
```

### Analytics
```http
GET /admin/analytics/*
Authorization: Bearer <jwt_token>
```

### Audit Logs
```http
GET /admin/audit-logs
Authorization: Bearer <jwt_token>
```

## Audit Logs
### Get Audit Logs
```http
GET /audit-logs
Query Parameters:
  - page: number
  - limit: number
  - startDate: string
  - endDate: string
  - type: string?
  - appId: string?
```

## Analytics
### Get Overview Stats
```http
GET /analytics/overview
Query Parameters:
  - startDate: string
  - endDate: string
  - appId: string?
```

### Get Revenue Metrics
```http
GET /analytics/revenue
Query Parameters:
  - startDate: string
  - endDate: string
  - appId: string?
  - interval: "day"|"week"|"month"
```

### Get Subscription Metrics
```http
GET /analytics/subscriptions
Query Parameters:
  - startDate: string
  - endDate: string
  - appId: string?
```

## Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "data": any,
  "error": {
    "code": string,
    "message": string
  }?,
  "meta": {
    "page": number,
    "limit": number,
    "total": number
  }?
}
```

## Error Codes
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Internal Server Error

## Error Responses

### Authentication Errors
```json
{
  "success": false,
  "error": {
    "code": "AUTH_ERROR",
    "message": "string"
  }
}
```

Common error codes:
- `TOKEN_EXPIRED`: JWT token has expired
- `INVALID_TOKEN`: JWT token is invalid
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `SESSION_EXPIRED`: Session has expired

## Rate Limiting
- Rate limit: 1000 requests per minute
- Rate limit header: `X-RateLimit-Limit`
- Remaining requests: `X-RateLimit-Remaining`
- Reset time: `X-RateLimit-Reset`

- Dashboard endpoints: 100 requests per minute per IP
- Failed authentication attempts: 5 per 15 minutes per IP
- Successful logins: 3 per 5 minutes per IP
