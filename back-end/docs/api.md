# API Documentation

## Overview

The Wildberry API is organized around REST principles. All requests should be made over HTTPS, and all response data is returned in JSON format.

## Authentication

### JWT Authentication

Most API endpoints require authentication using JSON Web Tokens (JWT). Include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

### API Keys

For server-to-server communication, use API keys. There are two types:
- Public Keys (`pub_`) - Limited access, safe for client-side use
- Private Keys (`priv_`) - Full access, server-side only

Include API keys in the Authorization header:
```
Authorization: ApiKey your_api_key
```

## Base URL

```
https://api.yourserver.com/api/v1
```

## Endpoints

### Authentication

#### POST /auth/login
Login with username and password.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": 3600
  }
}
```

### Apps

#### POST /apps
Create a new app.

**Request:**
```json
{
  "name": "string",
  "bundleId": "string",
  "platform": "ios|android|web",
  "description": "string"
}
```

#### GET /apps
List apps with pagination.

**Query Parameters:**
- page (default: 1)
- limit (default: 10)
- search (optional)

### Products

#### POST /products
Create a new product.

**Request:**
```json
{
  "name": "string",
  "appId": "string",
  "type": "subscription|one_time",
  "price": number,
  "currency": "string",
  "interval": "month|year|null",
  "description": "string"
}
```

#### GET /products
List products with filtering.

**Query Parameters:**
- appId (optional)
- type (optional)
- page (default: 1)
- limit (default: 10)

### Entitlements

#### POST /entitlements
Create a new entitlement.

**Request:**
```json
{
  "name": "string",
  "appId": "string",
  "description": "string",
  "features": ["string"]
}
```

#### GET /entitlements
List entitlements with filtering.

**Query Parameters:**
- appId (optional)
- search (optional)
- page (default: 1)
- limit (default: 10)

### Offerings

#### POST /offerings
Create a new offering.

**Request:**
```json
{
  "name": "string",
  "appId": "string",
  "description": "string",
  "products": ["string"],
  "entitlements": ["string"]
}
```

#### GET /offerings
List offerings with filtering.

**Query Parameters:**
- appId (optional)
- page (default: 1)
- limit (default: 10)

### API Keys

#### POST /api-keys/public
Create a public API key.

**Request:**
```json
{
  "name": "string",
  "appId": "string",
  "permissions": ["string"]
}
```

#### POST /api-keys/private
Create a private API key.

**Request:**
```json
{
  "name": "string",
  "appId": "string",
  "permissions": ["string"]
}
```

### Analytics

#### GET /analytics/overview
Get overview statistics.

**Query Parameters:**
- appId (required)
- startDate (optional)
- endDate (optional)

### Audit Logs

#### GET /audit-logs
List audit logs with filtering.

**Query Parameters:**
- appId (optional)
- action (optional)
- startDate (optional)
- endDate (optional)
- page (default: 1)
- limit (default: 10)

## Error Handling

The API uses conventional HTTP response codes:
- 2xx: Success
- 4xx: Client errors
- 5xx: Server errors

Error Response Format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Optional additional information
  }
}
```

Common Error Codes:
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1614556800
```
