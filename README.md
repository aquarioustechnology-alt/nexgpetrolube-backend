# NexGPetrolube Backend API

A comprehensive backend API for the NexGPetrolube B2B petroleum platform built with NestJS, Prisma, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete user lifecycle with KYC verification
- **Product Management**: Listings, categories, brands, and specifications
- **Auction System**: Reverse and traditional auctions with real-time bidding
- **Requirement Management**: Buyer requirements with quote system
- **Admin Panel**: Comprehensive admin interface for platform management
- **File Upload**: Document and image upload with AWS S3 integration
- **Real-time Features**: WebSocket support for live bidding
- **API Documentation**: Swagger/OpenAPI documentation
- **Database**: PostgreSQL with Prisma ORM

## 🏗️ Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **File Upload**: Multer with AWS S3
- **Real-time**: Socket.IO
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class-validator
- **Security**: Helmet, CORS, Rate limiting

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- pnpm (recommended) or npm
- AWS S3 bucket (for file uploads)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   pnpm prisma:generate
   
   # Run database migrations
   pnpm prisma:migrate
   
   # Seed the database
   pnpm prisma:seed
   ```

5. **Start the application**
   ```bash
   # Development
   pnpm start:dev
   
   # Production
   pnpm build
   pnpm start:prod
   ```

## 🔧 Environment Variables

Copy `env.example` to `.env` and configure the following variables:

### Database
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nexg_petrolube?schema=public"
```

### JWT Configuration
```env
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
```

### File Upload (AWS S3)
```env
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="nexg-petrolube-uploads"
```

### Email Configuration
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Payment Gateways
```env
STRIPE_SECRET_KEY="sk_test_..."
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-razorpay-secret"
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/api/v1/docs`
- **API Base URL**: `http://localhost:8000/api/v1`

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Buyer, seller, and admin users
- **KYC**: Know Your Customer verification
- **Categories**: Product categories and subcategories
- **Listings**: Product listings with specifications
- **Requirements**: Buyer requirements
- **Auctions**: Reverse and traditional auctions
- **Bids**: Auction bids
- **Quotes**: Requirement quotes
- **Notifications**: User notifications
- **Audit Logs**: Admin action tracking

## 🔐 Authentication

### User Authentication
```bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Admin Authentication
```bash
POST /api/v1/auth/admin/login
{
  "email": "admin@nexgpetrolube.com",
  "password": "Admin@123"
}
```

### Protected Routes
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

### Regular Users
- **BUYER**: Can post requirements and place bids
- **SELLER**: Can create listings and submit quotes
- **BOTH**: Can perform both buyer and seller actions

### Admin Users
- **SUPER_ADMIN**: Full system access
- **COMPLIANCE**: KYC and compliance management
- **MODERATOR**: Content and auction moderation
- **FINANCE**: Financial operations and reporting
- **CMS_EDITOR**: Content management
- **SUPPORT**: User support and basic reporting

## 🚀 Development

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

# Code Quality
pnpm lint               # Run ESLint
pnpm format             # Format code with Prettier
pnpm test               # Run tests
```

### Project Structure

```
src/
├── auth/               # Authentication & authorization
├── users/              # User management
├── kyc/                # KYC verification
├── products/           # Product listings
├── requirements/       # Buyer requirements
├── auctions/           # Auction system
├── bids/               # Bidding system
├── quotes/             # Quote management
├── categories/         # Categories & brands
├── notifications/      # Notification system
├── admin/              # Admin panel
├── upload/             # File upload
├── websocket/          # Real-time features
├── database/           # Database configuration
├── config/             # App configuration
└── common/             # Shared utilities
```

## 🔄 API Integration

### Frontend Integration
The API is designed to work seamlessly with the Next.js frontend and admin applications:

- **Frontend URL**: `http://localhost:3000`
- **Admin URL**: `http://localhost:3001`
- **API URL**: `http://localhost:8000/api/v1`

### WebSocket Events
Real-time features for live bidding:

```javascript
// Join auction room
socket.emit('join_auction', { auctionId: 'auction-123' });

// Place bid
socket.emit('place_bid', { 
  auctionId: 'auction-123', 
  amount: 1000, 
  userId: 'user-123' 
});

// Listen for new bids
socket.on('new_bid', (bid) => {
  console.log('New bid:', bid);
});
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 🚀 Deployment

### Production Build
```bash
pnpm build
pnpm start:prod
```

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

### Environment Variables for Production
Ensure all production environment variables are set:
- Database connection string
- JWT secrets
- AWS credentials
- Email configuration
- Payment gateway keys

## 📊 Monitoring

The application includes:
- Request logging
- Error tracking
- Performance monitoring
- Database query logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is proprietary software for NexGPetrolube.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api/v1/docs`
- Review the database schema in `prisma/schema.prisma`
- Check the environment configuration in `env.example`

---

**Built with ❤️ for NexGPetrolube B2B Platform**

*Production-ready backend API with comprehensive features, security, and scalability.*
