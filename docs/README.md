# NexGPetrolube Backend API Documentation

## Overview

The NexGPetrolube Backend API is a comprehensive NestJS-based backend service that powers the B2B petroleum platform. It provides authentication, user management, KYC verification, product listings, requirements management, auction systems, and administrative functionality.

## Table of Contents

1. [Architecture Overview](./architecture.md)
2. [API Endpoints](./api-endpoints.md)
3. [Services & Business Logic](./services.md)
4. [Database Schema](./database.md)
5. [Deployment Guide](./deployment.md)

## Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication for users and admins
- Role-based access control (RBAC)
- OTP verification for email and phone
- Password reset functionality
- Session management

### 👥 User Management
- Complete user lifecycle management
- User registration and profile management
- KYC document submission and verification
- Address and bank detail management
- User role assignment (BUYER, SELLER, BOTH)

### 📋 Content Management
- **Product Listings**: Seller product listings with specifications
- **Requirements**: Buyer requirements with quote system
- **Categories & Brands**: Hierarchical product categorization
- **Master Data**: Comprehensive product catalog management

### 🏆 Auction System
- **Traditional Auctions**: Seller-led auctions
- **Reverse Auctions**: Buyer-led auctions
- Real-time bidding with WebSocket support
- Bid management and validation
- Auction scheduling and monitoring

### 💼 Business Operations
- **Offers Management**: Listing and requirement offers
- **Quote System**: Requirement-based quoting
- **Payment Integration**: Stripe and Razorpay support
- **Logistics**: Transportation and delivery tracking
- **Notifications**: Real-time and email notifications

### 🛡️ Admin Panel
- **User Management**: Complete user administration
- **KYC Review**: Document verification workflow
- **Content Moderation**: Listings and requirements approval
- **Analytics Dashboard**: Platform statistics and KPIs
- **Audit Logging**: Comprehensive activity tracking

### 🔄 Real-time Communication

- **WebSocket Gateway**: Real-time communication for auctions and notifications
- **Live Auction Rooms**: Dynamic auction room management with participant tracking
- **Bid Broadcasting**: Real-time bid updates to all auction participants
- **Notification Broadcasting**: Instant notification delivery to connected clients

### 📦 Advanced Logistics

- **Logistics Tracking**: Complete logistics entry creation and management
- **Status Updates**: Real-time logistics status tracking and updates
- **Delivery Management**: Comprehensive delivery tracking and coordination
- **Transportation Coordination**: Multi-modal transportation management

### 💬 Communication Systems

- **Bids Management**: Comprehensive bidding system with bid history and analytics
- **Quotes System**: Quote generation and management for negotiations
- **Counter Offers**: Advanced negotiation system with counter-offer capabilities
- **Negotiation Window Expiry**: Automatic offer expiration based on configurable time windows (12h, 24h, 36h, 48h, 1 week)
- **Auto-Rejection Cron Job**: Scheduled task running every 5 minutes to auto-expire offers past their negotiation window
- **Notifications Service**: Real-time notification system for users

## Technology Stack

- **Framework**: NestJS 10.x with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport strategies
- **File Upload**: Multer with AWS S3 integration
- **Real-time**: Socket.IO for WebSocket connections
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator and class-transformer
- **Security**: Helmet, CORS, Rate limiting
- **Testing**: Jest for unit and E2E testing

## Project Structure

```
Backend/
├── src/
│   ├── auth/                    # Authentication & authorization
│   │   ├── controllers/         # Auth controllers
│   │   ├── services/           # Auth business logic
│   │   ├── guards/             # JWT and role guards
│   │   ├── strategies/          # Passport strategies
│   │   └── dto/                # Auth DTOs
│   ├── users/                  # User management
│   ├── admin/                  # Admin panel functionality
│   │   ├── users/              # Admin user management
│   │   ├── kyc/                # KYC review
│   │   ├── listings/           # Content moderation
│   │   ├── requirements/       # Requirements management
│   │   ├── dashboard/          # Admin dashboard
│   │   └── audit/              # Audit logging
│   ├── products/               # Product management
│   ├── requirements/           # Requirements system
│   ├── auctions/              # Auction system
│   ├── bids/                  # Bidding functionality
│   ├── offers/                # Offers management
│   ├── quotes/                # Quote system
│   ├── categories/             # Categories & brands
│   ├── kyc/                   # KYC verification
│   ├── notifications/         # Notification system
│   ├── upload/                # File upload service
│   ├── websocket/             # Real-time features
│   ├── payments/              # Payment integration
│   ├── logistics/             # Logistics management
│   ├── database/              # Database configuration
│   ├── config/                # App configuration
│   └── common/                # Shared utilities
├── prisma/                    # Database schema and migrations
├── uploads/                   # File storage
├── scripts/                   # Utility scripts
├── test/                      # Test files
└── docs/                      # Documentation
```

## API Architecture

### RESTful API Design
- **Base URL**: `http://localhost:8000/api/v1`
- **Authentication**: Bearer token in Authorization header
- **Response Format**: Consistent JSON responses
- **Error Handling**: Standardized error responses
- **Pagination**: Cursor-based pagination for large datasets

### API Endpoints Structure
```
/api/v1/
├── auth/                      # Authentication endpoints
├── users/                     # User management
├── admin/                     # Admin panel endpoints
├── products/                  # Product management
├── requirements/              # Requirements system
├── auctions/                  # Auction system
├── bids/                      # Bidding
├── offers/                    # Offers management
├── quotes/                    # Quote system
├── categories/                # Categories & brands
├── kyc/                       # KYC verification
├── notifications/             # Notifications
├── upload/                    # File upload
├── payments/                  # Payment processing
├── logistics/                 # Logistics
└── websocket/                 # WebSocket gateway
```

## Database Design

### Core Entities
- **Users**: User accounts with roles and profiles
- **KYC**: Know Your Customer verification
- **Categories**: Product categories and subcategories
- **Products**: Product catalog with specifications
- **Listings**: Seller product listings
- **Requirements**: Buyer requirements
- **Auctions**: Auction management
- **Bids**: Auction bidding
- **Offers**: Listing and requirement offers
- **Quotes**: Requirement quotes
- **Notifications**: User notifications
- **Audit Logs**: Admin activity tracking

### Relationships
- Users have one-to-many relationships with listings, requirements, bids, offers
- Categories have hierarchical relationships (parent-child)
- Products belong to categories and brands
- Auctions are associated with listings or requirements
- Offers connect users with listings/requirements

## Security Features

### Authentication Security
- JWT tokens with expiration
- Refresh token mechanism
- Password hashing with bcrypt
- OTP verification for sensitive operations
- Rate limiting on authentication endpoints

### Authorization
- Role-based access control
- Resource-level permissions
- Admin role hierarchy
- Protected route guards

### Data Security
- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- XSS protection
- CORS configuration
- Helmet security headers

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm or npm
- AWS S3 bucket (for file uploads)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd Backend

# Install dependencies
pnpm install

# Environment setup
cp env.example .env
# Configure your environment variables

# Database setup
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed

# Start development server
pnpm start:dev
```

### Available Scripts
```bash
# Development
pnpm start:dev          # Start with hot reload
pnpm start:debug        # Start with debugging

# Building
pnpm build              # Build for production
pnpm start:prod         # Start production server

# Database
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate     # Run migrations
pnpm prisma:deploy      # Deploy migrations
pnpm prisma:seed        # Seed database
pnpm prisma:studio      # Open Prisma Studio

# Testing
pnpm test               # Run unit tests
pnpm test:e2e           # Run E2E tests
pnpm test:cov           # Test coverage

# Code Quality
pnpm lint               # Run ESLint
pnpm format             # Format code with Prettier
```

## API Documentation

### Swagger Documentation
- **Development**: `http://localhost:8000/api/v1/docs`
- **Interactive API Explorer**: Full Swagger UI interface
- **Authentication**: Bearer token support
- **Request/Response Examples**: Comprehensive examples

### API Testing
```bash
# Test authentication
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Test protected endpoint
curl -X GET http://localhost:8000/api/v1/users/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Integration Points

### Frontend Integration
- **Frontend URL**: `http://localhost:3000`
- **Admin URL**: `http://localhost:3001`
- **API URL**: `http://localhost:8000/api/v1`

### WebSocket Events
```javascript
// Real-time auction bidding
socket.emit('join_auction', { auctionId: 'auction-123' });
socket.emit('place_bid', { auctionId: 'auction-123', amount: 1000 });

// Listen for events
socket.on('new_bid', (bid) => console.log('New bid:', bid));
socket.on('auction_ended', (auction) => console.log('Auction ended:', auction));
```

### File Upload Integration
- **Single File**: `POST /api/v1/upload/single` (AWS S3)
- **Multiple Files**: `POST /api/v1/upload/multiple` (AWS S3)
- **Admin Uploads**: `POST /api/v1/admin/uploads/upload` (AWS S3 with metadata)
- **File Types**: Images, PDFs, documents, CSV files
- **Storage**: AWS S3 with signed URLs for secure access
- **CSV Image Processing**: Automatic image download and S3 upload from CSV URLs

## Monitoring & Logging

### Application Monitoring
- Request/response logging
- Error tracking and reporting
- Performance metrics
- Database query logging

### Audit Trail
- Admin action logging
- User activity tracking
- System event logging
- Compliance reporting

## Deployment

### Production Considerations
- Environment variable configuration
- Database migration strategy
- File storage configuration
- Security hardening
- Performance optimization
- Monitoring setup

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "run", "start:prod"]
```

## Contributing

### Development Guidelines
1. Follow NestJS best practices
2. Write comprehensive tests
3. Use TypeScript strict mode
4. Follow the established code style
5. Update documentation for new features

### Code Style
- ESLint and Prettier configuration
- TypeScript strict mode
- Consistent naming conventions
- Comprehensive error handling

## Support

For technical support or questions:
- Check the API documentation at `/api/v1/docs`
- Review the database schema in `prisma/schema.prisma`
- Check the environment configuration in `env.example`
- Refer to the detailed documentation in the `/docs` folder

---

*Last updated: January 2025*

**Built with ❤️ for NexGPetrolube B2B Platform**

*Production-ready backend API with comprehensive features, security, and scalability.*
