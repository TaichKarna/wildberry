# Apple App Store Server API Integration

This document provides information about the integration with Apple's App Store Server API for handling subscriptions, transactions, and notifications.

## Overview

The integration allows the backend to:
- Fetch subscription status from Apple
- Retrieve transaction history
- Look up orders by ID
- Process server-to-server notifications from Apple

## Configuration

To use the Apple App Store Server API, you need to configure the following environment variables:

```
APPLE_PRIVATE_KEY=your_private_key_here
APPLE_KEY_ID=your_key_id_here
APPLE_ISSUER_ID=your_issuer_id_here
APPLE_BUNDLE_ID=com.yourapp.bundle
```

### Setting up the Private Key

1. Generate a private key in App Store Connect (Users and Access > Keys > App Store Connect API)
2. Download the .p8 file
3. Format the key as a single line by replacing newlines with \n
4. Add it to your environment variables

Example:
```
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIGTAgEA...\n-----END PRIVATE KEY-----
```

## API Endpoints

### Customer Info

`GET /api/v1/customer/:app_user_id`

Fetches customer information, including subscription status from Apple if a transaction ID is available.

### Purchase

`POST /api/v1/purchase`

Processes a purchase, including validation with Apple's servers.

Request body:
```json
{
  "app_user_id": "user123",
  "transaction_id": "1000000123456789",
  "product_id": "com.example.subscription.monthly"
}
```

### Order Lookup

`GET /api/v1/order/:order_id`

Looks up order details using Apple's API.

## Webhook Integration

Apple sends server-to-server notifications for subscription events (renewals, cancellations, etc.).

### Webhook URL

Configure your webhook URL in App Store Connect to:
```
https://your-api-domain.com/api/v1/webhooks/apple
```

### Notification Types

The system handles the following notification types:
- `SUBSCRIBED`: New subscription
- `DID_RENEW`: Subscription renewed
- `DID_CHANGE_RENEWAL_STATUS`: Auto-renewal status changed
- `EXPIRED`: Subscription expired
- `DID_FAIL_TO_RENEW`: Renewal failed
- `REFUND`: Refund issued

## Implementation Details

### Authentication

The integration uses JWT (JSON Web Token) for authentication with Apple's servers. The token is generated using the private key and includes the necessary claims required by Apple.

### Data Mapping

Apple's response data is mapped to the internal `CustomerInfo` format to maintain compatibility with the existing API structure.

### Error Handling

The integration includes robust error handling to ensure that if the Apple API is unavailable, the system falls back to using local data.

## Testing

To test the integration:
1. Use Apple's sandbox environment by setting `NODE_ENV=development`
2. Create test subscriptions through TestFlight or the sandbox environment
3. Verify webhook notifications using Apple's test notification feature

## References

- [Apple App Store Server API Documentation](https://developer.apple.com/documentation/appstoreserverapi)
- [App Store Server Notifications](https://developer.apple.com/documentation/appstoreservernotifications)
- [JWS Signature Verification](https://developer.apple.com/documentation/appstoreserverapi/verifying_signed_transactions)
