Join our Discord community:  
<a href="https://discord.gg/7vCkqfyn"><img src="https://img.icons8.com/color/24/000000/discord-logo.png" alt="Discord Logo" /></a> 

# Wildberry

A comprehensive in-app purchase and subscription management system with a modern React frontend and robust TypeScript backend.

## Overview

Wildberry provides a complete solution for managing in-app purchases, subscriptions, and entitlements. It includes:

- **Frontend**: Modern React application with Material-UI
- **Backend**: TypeScript-based API with PostgreSQL
- **Authentication**: JWT-based auth with API key support
- **Analytics**: Built-in subscription and revenue analytics
- **Audit Logs**: Comprehensive activity tracking

## Project Structure

```
wildberry/
├── front-end/          # React frontend application
│   ├── src/           # Source code
│   │   ├── components/    # Reusable UI components
│   │   │   ├── common/   # Shared components
│   │   │   ├── layout/   # Layout components
│   │   │   ├── forms/    # Form components
│   │   │   ├── tables/   # Table components
│   │   │   ├── charts/   # Chart components
│   │   │   └── modals/   # Modal components
│   │   ├── pages/        # Page components
│   │   │   ├── apps/     # App management
│   │   │   ├── auth/     # Authentication
│   │   │   ├── products/ # Product management
│   │   │   ├── offerings/# Offering management
│   │   │   ├── analytics/# Analytics dashboard
│   │   │   └── settings/ # User settings
│   │   ├── hooks/        # Custom React hooks
│   │   
│   ├── public/        # Static assets
│   │   ├── images/    # Image assets
│   │   ├── fonts/     # Font files
│   │   └── icons/     # Icon assets
│   ├── package.json   # Frontend dependencies
│   ├── tsconfig.json  # TypeScript configuration
│   ├── .env.example   # Environment template
│   
│
├── back-end/          # TypeScript backend API
│   ├── src/          # Source code
│   │   ├── config/   # Configuration files
│   │   ├── modules/  # Feature modules
│   │   │   ├── apps/        # App management
│   │   │   ├── auth/        # Authentication
│   │   │   ├── products/    # Product management
│   │   │   ├── entitlements/# Entitlement handling
│   │   │   ├── offerings/   # Offering management
│   │   │   ├── api-keys/    # API key management
│   │   │   ├── analytics/   # Analytics processing
│   │   │   └── audit-logs/  # Audit logging
│   │   ├── middleware/# Express middleware
│   │   ├── models/   # Database models
│   │   ├── services/ # Business logic
│   │   ├── types/    # TypeScript type definitions
│   │   └── utils/    # Utility functions
│   ├── test/         # Test files
│   │   ├── unit/     # Unit tests
│   │   ├── integration/ # Integration tests
│   │   ├── fixtures/ # Test data
│   │   └── setup/    # Test configuration
│   ├── docs/         # Documentation
│   │   ├── api.md    # API documentation
│   │   └── architecture.md # System architecture
│   ├── scripts/      # Build and utility scripts
│   ├── dist/         # Compiled code
│   ├── package.json  # Dependencies
│   ├── tsconfig.json # TypeScript configuration
│   └── .env.example  # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js >= 16
- PostgreSQL >= 15
- npm or yarn

### Docker Setup

#### Development Environment

Run the entire stack in development mode with hot-reloading:

```bash
docker compose -f docker-compose.dev.yaml up -d
```

This will start:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- pgAdmin: http://localhost:5050
- PostgreSQL: localhost:5432

#### Production Environment

For production deployment:

```bash
docker compose up -d
```

#### Individual Service Management

Start specific services:
```bash
# Start only backend services
docker compose up -d backend postgres

# Start only frontend
docker compose up -d frontend

# Start database management
docker compose up -d postgres pgadmin
```

View logs:
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
```

Rebuild services:
```bash
# Rebuild all
docker compose build

# Rebuild specific service
docker compose build frontend
docker compose build backend
```

Stop services:
```bash
# Stop all
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd back-end
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

4. Start the development server:
```bash
# Using Docker (recommended)
docker compose -f docker-compose.dev.yaml up -d

# Without Docker
npm run dev
```

The backend API will be available at:
- API: http://localhost:3000
- pgAdmin: http://localhost:5050 (when using Docker)
- API Documentation: http://localhost:3000/docs

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd front-end
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at http://localhost:3001

## Features

### Backend Features

- **Authentication & Authorization**
  - JWT-based authentication
  - API key management
  - Role-based access control

- **App Management**
  - Multiple app support
  - Platform-specific configurations
  - Bundle ID validation

- **Product Management**
  - Subscription and one-time purchase support
  - Price and currency handling
  - Product lifecycle management

- **Entitlements**
  - Feature-based access control
  - Flexible entitlement mapping
  - Inheritance and grouping

- **Offerings**
  - Product bundling
  - Dynamic offering configuration
  - A/B testing support

- **Analytics**
  - Revenue tracking
  - Subscription metrics
  - User behavior analytics

- **Audit Logging**
  - Comprehensive activity tracking
  - Security event logging
  - Change history

### Frontend Features

- **Modern UI/UX**
  - Material-UI components
  - Responsive design
  - Dark mode support

- **Dashboard**
  - Revenue metrics
  - Subscription analytics
  - User activity tracking

- **Management Interfaces**
  - Product management
  - Subscription handling
  - User management

- **Mobile-First Design**
  - Responsive layouts
  - Touch-friendly interfaces
  - Adaptive components

## Development

### Running Tests

Backend:
```bash
cd back-end
npm test
```

Frontend:
```bash
cd front-end
npm test
```

### API Documentation

- [API Documentation](./back-end/docs/api.md)
- [Architecture Documentation](./back-end/docs/architecture.md)

### Contributing

Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

## Deployment

### Backend Deployment

Using Docker:
```bash
cd back-end
docker compose up -d
```

Manual deployment:
```bash
cd back-end
npm run build
npm start
```

### Frontend Deployment

```bash
cd front-end
npm run build
# Deploy the build directory to your hosting service
```

## License

MIT License - see LICENSE file for details
