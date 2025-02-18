# Wildberry Backend

A comprehensive backend system for managing in-app purchases, subscriptions, and entitlements. Built with TypeScript, Express, and PostgreSQL.

## Features

- 🔐 Authentication & Authorization
  - JWT-based authentication
  - API key management
  - Role-based access control

- 📱 App Management
  - Multiple app support
  - Platform-specific configurations
  - Bundle ID validation

- 💰 Product Management
  - Subscription and one-time purchase support
  - Price and currency handling
  - Product lifecycle management

- ✨ Entitlements
  - Feature-based access control
  - Flexible entitlement mapping
  - Inheritance and grouping

- 🎁 Offerings
  - Product bundling
  - Dynamic offering configuration
  - A/B testing support

- 📊 Analytics
  - Revenue tracking
  - Subscription metrics
  - User behavior analytics

- 📝 Audit Logging
  - Comprehensive activity tracking
  - Security event logging
  - Change history

## Prerequisites

- Node.js >= 16
- PostgreSQL >= 13
- TypeScript >= 4.5

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wildberry-backend.git
cd wildberry-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
npm run migrate
```

5. Start the development server:
```bash
npm run dev
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Documentation

- [API Documentation](./docs/api.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## License

MIT License - see LICENSE file for details
