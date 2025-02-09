# Wildberry Backend

This directory contains the Node.js/Express backend application with PostgreSQL database integration for Wildberry.

## Structure

```
back-end/
├── config/        # Configuration files
├── controllers/   # Request handlers
├── models/        # Database models
├── routes/        # API routes
├── middleware/    # Custom middleware
├── utils/         # Utility functions
└── tests/         # Test files
```

## Database Schema

The PostgreSQL database includes tables for:
- Users
- Subscriptions
- Products
- Transactions
- Analytics

## API Endpoints

The backend provides RESTful APIs for:
- User management
- Subscription handling
- Payment processing
- Analytics and reporting

## Development

1. Set up PostgreSQL database
2. Configure environment variables
3. Install dependencies:
```bash
npm install
```
4. Run migrations:
```bash
npm run migrate
```
5. Start development server:
```bash
npm run dev
```

## Best Practices

- Follow RESTful API design principles
- Implement proper error handling
- Use middleware for authentication
- Write comprehensive tests
- Document API endpoints
- Follow security best practices
