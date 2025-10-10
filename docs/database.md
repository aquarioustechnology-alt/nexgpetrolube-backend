# Database Schema & Prisma Documentation

## Overview

The NexGPetrolube Backend API uses PostgreSQL as the primary database with Prisma ORM for database operations. This documentation covers the database schema, relationships, migrations, and Prisma configuration.

## Database Configuration

### Prisma Setup

**Prisma Schema Location**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Environment Configuration

```env
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/nexg_petrolube?schema=public"

# Prisma configuration
PRISMA_CLIENT_ENGINE_TYPE="binary"
```

## Core Database Schema

### 1. User Management

#### Users Table
```prisma
model User {
  id              String         @id @default(cuid())
  email           String         @unique
  phone           String?
  firstName       String?
  lastName        String?
  companyName     String
  role            UserRole       @default(BUYER)
  kycStatus       KycStatus      @default(PENDING)
  isActive        Boolean        @default(true)
  isEmailVerified Boolean        @default(false)
  isPhoneVerified Boolean        @default(false)
  profileImage    String?
  password        String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  // Relationships
  addresses       Address[]
  bankDetails     BankDetail?
  bids            Bid[]
  kyc             Kyc?
  listings        Listing[]
  notifications   Notification[]
  quotes          Quote[]
  requirements    Requirement[]
  wishlist        WishlistItem[]
  offers          Offer[]           @relation("UserOffers")
  requirementOwnerOffers Offer[]    @relation("RequirementOwnerOffers")
  offerHistory    OfferHistory[]    @relation("UserOfferHistory")
  offerNotifications OfferNotification[] @relation("UserOfferNotifications")
  payments        Payment[]
  logistics       Logistics[]

  @@map("users")
}
```

#### Address Table
```prisma
model Address {
  id        String   @id @default(cuid())
  userId    String
  type      String
  line1     String
  line2     String?
  city      String
  state     String
  country   String   @default("India")
  pincode   String
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("addresses")
}
```

#### Bank Details Table
```prisma
model BankDetail {
  id            String   @id @default(cuid())
  userId        String   @unique
  accountNumber String
  ifscCode      String
  bankName      String
  accountHolderName String
  isVerified    Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("bank_details")
}
```

### 2. KYC Management

#### KYC Table
```prisma
model Kyc {
  id              String        @id @default(cuid())
  userId          String        @unique
  panNumber       String?
  aadhaarNumber   String?
  gstNumber       String?
  yearsInBusiness Int?
  kycStatus       KycStatus     @default(PENDING)
  rejectionReason String?
  reviewedBy      String?
  reviewedAt      DateTime?
  submittedAt     DateTime      @default(now())
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  documents       KycDocument[]

  @@map("kyc")
}
```

#### KYC Documents Table
```prisma
model KycDocument {
  id         String   @id @default(cuid())
  kycId      String
  type       String
  fileName   String
  fileUrl    String
  thumbnailUrl String?
  uploadedAt DateTime @default(now())
  kyc        Kyc      @relation(fields: [kycId], references: [id], onDelete: Cascade)

  @@map("kyc_documents")
}
```

### 3. Product Catalog

#### Categories Table
```prisma
model Category {
  id          String       @id @default(cuid())
  name        String
  description String?
  parentId    String?
  sortOrder   Int          @default(0)
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  parent      Category?    @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[]   @relation("CategoryHierarchy")
  products    Product[]
  listings    Listing[]
  requirements Requirement[]

  @@map("categories")
}
```

#### Brands Table
```prisma
model Brand {
  id          String       @id @default(cuid())
  name        String
  description String?
  logo        String?
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  products    Product[]
  listings    Listing[]
  requirements Requirement[]

  @@map("brands")
}
```

#### Products Table
```prisma
model Product {
  id             String       @id @default(cuid())
  name           String
  description    String?
  categoryId     String
  brandId        String
  specifications Json?
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  category       Category     @relation(fields: [categoryId], references: [id])
  brand          Brand        @relation(fields: [brandId], references: [id])
  listings       Listing[]
  requirements   Requirement[]

  @@map("products")
}
```

### 4. Listings Management

#### Listings Table
```prisma
model Listing {
  id                String        @id @default(cuid())
  userId            String
  title             String
  shortDescription  String?
  detailedDescription String?
  categoryId        String
  productId         String
  brandId           String
  quantity          Int
  units             String
  unitPrice         Decimal
  totalPrice        Decimal
  postingType       PostingType   @default(LISTING)
  negotiableType    NegotiableType @default(NEGOTIABLE)
  status            ListingStatus @default(DRAFT)
  adminStatus       AdminStatus?  @default(PENDING)
  visibility        Visibility    @default(PUBLIC)
  userType          UserType      @default(SELLER)
  images            String[]
  specifications    Json?
  quotesCount       Int           @default(0)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  user              User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  category          Category      @relation(fields: [categoryId], references: [id])
  product           Product       @relation(fields: [productId], references: [id])
  brand             Brand         @relation(fields: [brandId], references: [id])
  quotes            Quote[]
  offers            Offer[]
  auctions          Auction[]

  @@map("listings")
}
```

### 5. Requirements Management

#### Requirements Table
```prisma
model Requirement {
  id                String           @id @default(cuid())
  userId            String
  title             String
  shortDescription  String?
  detailedDescription String?
  categoryId        String
  productId         String
  brandId           String
  quantity          Int
  units             String
  unitPrice         Decimal?
  totalBudget       Decimal?
  postingType       PostingType      @default(REQUIREMENT)
  negotiableType    NegotiableType   @default(NEGOTIABLE)
  status            RequirementStatus @default(DRAFT)
  adminStatus       AdminStatus?     @default(PENDING)
  visibility        Visibility       @default(PUBLIC)
  userType          UserType         @default(BUYER)
  images            String[]
  specifications    Json?
  quotesCount       Int              @default(0)
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  user              User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  category          Category         @relation(fields: [categoryId], references: [id])
  product           Product          @relation(fields: [productId], references: [id])
  brand             Brand            @relation(fields: [brandId], references: [id])
  quotes            Quote[]
  offers            Offer[]
  auctions          Auction[]

  @@map("requirements")
}
```

### 6. Auction System

#### Auctions Table
```prisma
model Auction {
  id            String        @id @default(cuid())
  title         String
  description   String?
  type          AuctionType   @default(TRADITIONAL)
  listingId     String?
  requirementId String?
  userId        String
  startingPrice Decimal
  reservePrice  Decimal?
  currentPrice  Decimal?
  bidIncrement  Decimal       @default(1.00)
  status        AuctionStatus @default(SCHEDULED)
  startTime     DateTime
  endTime       DateTime
  duration      Int           // in minutes
  winnerId      String?
  finalBid      Decimal?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing       Listing?      @relation(fields: [listingId], references: [id])
  requirement   Requirement?  @relation(fields: [requirementId], references: [id])
  bids          Bid[]
  winner        User?         @relation("AuctionWinner", fields: [winnerId], references: [id])

  @@map("auctions")
}
```

#### Bids Table
```prisma
model Bid {
  id        String      @id @default(cuid())
  auctionId String
  userId    String
  amount    Decimal
  autoBid   Boolean     @default(false)
  maxBid    Decimal?
  status    BidStatus   @default(ACTIVE)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  auction   Auction     @relation(fields: [auctionId], references: [id], onDelete: Cascade)
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("bids")
}
```

### 7. Offers Management

#### Offers Table
```prisma
model Offer {
  id                String        @id @default(cuid())
  offerStatus       OfferStatus   @default(PENDING)
  price             Decimal
  quantity          Int
  negotiableType    NegotiableType @default(NEGOTIABLE)
  isCounterOffer    Boolean       @default(false)
  originalOfferId   String?
  validUntil        DateTime?
  notes             String?
  listingId         String?
  requirementId     String?
  offerUserId       String
  listingOwnerId    String?
  requirementOwnerId String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  offerUser         User          @relation("UserOffers", fields: [offerUserId], references: [id], onDelete: Cascade)
  listingOwner      User?         @relation("RequirementOwnerOffers", fields: [listingOwnerId], references: [id])
  requirementOwner  User?         @relation("RequirementOwnerOffers", fields: [requirementOwnerId], references: [id])
  listing           Listing?      @relation(fields: [listingId], references: [id])
  requirement       Requirement?  @relation(fields: [requirementId], references: [id])
  originalOffer     Offer?        @relation("CounterOffers", fields: [originalOfferId], references: [id])
  counterOffers     Offer[]       @relation("CounterOffers")
  offerHistory      OfferHistory[]
  offerNotifications OfferNotification[]

  @@map("offers")
}
```

#### Offer History Table
```prisma
model OfferHistory {
  id          String   @id @default(cuid())
  offerId     String
  userId      String
  action      String
  details     Json?
  createdAt   DateTime @default(now())
  offer       Offer    @relation(fields: [offerId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("offer_history")
}
```

### 8. Quotes Management

#### Quotes Table
```prisma
model Quote {
  id            String      @id @default(cuid())
  listingId     String?
  requirementId String?
  userId        String
  price         Decimal
  quantity      Int
  deliveryTime  String?
  notes         String?
  status        QuoteStatus @default(PENDING)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing       Listing?    @relation(fields: [listingId], references: [id])
  requirement   Requirement? @relation(fields: [requirementId], references: [id])

  @@map("quotes")
}
```

### 9. Notifications System

#### Notifications Table
```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  data      Json?
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

#### Offer Notifications Table
```prisma
model OfferNotification {
  id        String   @id @default(cuid())
  offerId   String
  userId    String
  type      String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  offer     Offer    @relation(fields: [offerId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("offer_notifications")
}
```

### 10. Payment System

#### Payments Table
```prisma
model Payment {
  id            String        @id @default(cuid())
  userId        String
  amount        Decimal
  currency      String        @default("INR")
  paymentMethod PaymentMethod
  status        PaymentStatus @default(PENDING)
  transactionId String?
  orderId       String?
  description   String?
  metadata      Json?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("payments")
}
```

### 11. Logistics Management

#### Logistics Table
```prisma
model Logistics {
  id              String           @id @default(cuid())
  offerId         String
  userId          String
  transportation  TransportationType
  deliveryDate    DateTime
  pickupAddress   Json
  deliveryAddress Json
  trackingNumber  String?
  status          LogisticsStatus  @default(PENDING)
  notes           String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  offer           Offer            @relation(fields: [offerId], references: [id], onDelete: Cascade)
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("logistics")
}
```

### 12. Admin Management

#### Admin Users Table
```prisma
model Admin {
  id          String     @id @default(cuid())
  email       String     @unique
  password    String
  firstName   String
  lastName    String
  role        AdminRole  @default(SUPPORT)
  isActive    Boolean    @default(true)
  lastLoginAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  auditLogs   AuditLog[]

  @@map("admins")
}
```

#### Audit Logs Table
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  adminId     String
  action      String
  resource    String
  resourceId  String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  admin       Admin    @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@map("audit_logs")
}
```

### 13. OTP Verification

#### OTP Verification Table
```prisma
model OtpVerification {
  id        String   @id @default(cuid())
  email     String   @unique
  phone     String?
  otp       String
  attempts  Int      @default(0)
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("otp_verifications")
}
```

### 14. Wishlist Management

#### Wishlist Items Table
```prisma
model WishlistItem {
  id            String   @id @default(cuid())
  userId        String
  listingId     String?
  requirementId String?
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing       Listing? @relation(fields: [listingId], references: [id], onDelete: Cascade)
  requirement   Requirement? @relation(fields: [requirementId], references: [id], onDelete: Cascade)

  @@map("wishlist_items")
}
```

## Enums and Types

### User Roles and Status
```prisma
enum UserRole {
  BUYER
  SELLER
  BOTH
}

enum KycStatus {
  NOT_SUBMITTED
  PENDING
  APPROVED
  REJECTED
}

enum UserType {
  BUYER
  SELLER
  BOTH
}
```

### Listing and Requirement Status
```prisma
enum ListingStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
  ACTIVE
  INACTIVE
  SOLD
}

enum RequirementStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
  OPEN
  CLOSED
}

enum AdminStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### Auction Types and Status
```prisma
enum AuctionType {
  TRADITIONAL
  REVERSE
}

enum AuctionStatus {
  SCHEDULED
  LIVE
  PAUSED
  ENDED
  CANCELLED
}

enum BidStatus {
  ACTIVE
  OUTBID
  WON
  LOST
}
```

### Offer and Quote Status
```prisma
enum OfferStatus {
  PENDING
  ACCEPTED
  REJECTED
  COUNTERED
  EXPIRED
  WITHDRAWN
}

enum QuoteStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}
```

### Payment and Logistics
```prisma
enum PaymentMethod {
  STRIPE
  RAZORPAY
  BANK_TRANSFER
  UPI
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}

enum TransportationType {
  ROAD
  RAIL
  AIR
  SEA
}

enum LogisticsStatus {
  PENDING
  CONFIRMED
  IN_TRANSIT
  DELIVERED
  CANCELLED
}
```

### Admin Roles
```prisma
enum AdminRole {
  SUPER_ADMIN
  COMPLIANCE
  MODERATOR
  FINANCE
  CMS_EDITOR
  SUPPORT
}
```

### Other Enums
```prisma
enum PostingType {
  LISTING
  REQUIREMENT
  REVERSE_BIDDING
  STANDARD_BIDDING
}

enum NegotiableType {
  FIXED
  NEGOTIABLE
  BIDDING
}

enum Visibility {
  PUBLIC
  PRIVATE
}

enum NotificationType {
  OFFER_RECEIVED
  OFFER_ACCEPTED
  OFFER_REJECTED
  AUCTION_STARTED
  AUCTION_ENDED
  BID_PLACED
  KYC_APPROVED
  KYC_REJECTED
  SYSTEM_NOTIFICATION
}
```

## Database Relationships

### One-to-One Relationships
- User ↔ KYC
- User ↔ BankDetail
- User ↔ Admin (for admin users)

### One-to-Many Relationships
- User → Addresses
- User → Listings
- User → Requirements
- User → Bids
- User → Offers
- User → Notifications
- User → Payments
- User → Logistics
- Category → Products
- Category → Listings
- Category → Requirements
- Brand → Products
- Brand → Listings
- Brand → Requirements
- Product → Listings
- Product → Requirements
- Auction → Bids
- Listing → Quotes
- Listing → Offers
- Requirement → Quotes
- Requirement → Offers
- Offer → OfferHistory
- Offer → OfferNotifications

### Many-to-Many Relationships
- User ↔ WishlistItems (via listings/requirements)

### Self-Referencing Relationships
- Category → Subcategories (parent-child hierarchy)
- Offer → CounterOffers (original-counter offer relationship)

## Database Indexes

### Primary Indexes
All tables have primary key indexes on `id` fields.

### Unique Indexes
```prisma
// Users table
@@unique([email])

// Admin table
@@unique([email])

// OTP Verification table
@@unique([email])
```

### Composite Indexes
```prisma
// Performance optimization indexes
@@index([userId, createdAt])
@@index([categoryId, isActive])
@@index([auctionId, createdAt])
@@index([offerStatus, createdAt])
@@index([kycStatus, submittedAt])
```

## Database Migrations

### Migration Commands

```bash
# Generate Prisma client
pnpm prisma:generate

# Create new migration
pnpm prisma:migrate dev --name migration_name

# Apply migrations to production
pnpm prisma:migrate deploy

# Reset database (development only)
pnpm prisma:migrate reset

# View migration status
pnpm prisma:migrate status
```

### Migration Files Structure
```
prisma/
├── migrations/
│   ├── 20250916055513_initial/
│   │   └── migration.sql
│   ├── 20250917075034_add_products_table/
│   │   └── migration.sql
│   └── migration_lock.toml
├── schema.prisma
└── seed.ts
```

### Sample Migration
```sql
-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "companyName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'BUYER',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileImage" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

## Database Seeding

### Seed File (`prisma/seed.ts`)

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@nexgpetrolube.com' },
    update: {},
    create: {
      email: 'admin@nexgpetrolube.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
    },
  });

  // Create categories
  const lubricantsCategory = await prisma.category.create({
    data: {
      name: 'Lubricants',
      description: 'Industrial and automotive lubricants',
      sortOrder: 1,
    },
  });

  const engineOilSubcategory = await prisma.category.create({
    data: {
      name: 'Engine Oil',
      description: 'Engine lubricating oils',
      parentId: lubricantsCategory.id,
      sortOrder: 1,
    },
  });

  // Create brands
  const shellBrand = await prisma.brand.create({
    data: {
      name: 'Shell',
      description: 'Shell lubricants and oils',
      logo: '/uploads/brands/shell-logo.png',
    },
  });

  // Create products
  const engineOilProduct = await prisma.product.create({
    data: {
      name: 'Shell Helix Ultra 5W-30',
      description: 'Premium synthetic engine oil',
      categoryId: engineOilSubcategory.id,
      brandId: shellBrand.id,
      specifications: {
        viscosity: '5W-30',
        type: 'Synthetic',
        capacity: '4L',
        apiRating: 'SN/CF',
      },
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Running Seeds

```bash
# Run seed script
pnpm prisma:seed

# Reset and seed
pnpm prisma:migrate reset
```

## Database Queries

### Common Query Patterns

#### User Queries
```typescript
// Get user with all relations
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    addresses: true,
    kyc: {
      include: {
        documents: true,
      },
    },
    listings: {
      include: {
        category: true,
        brand: true,
        product: true,
      },
    },
    requirements: {
      include: {
        category: true,
        brand: true,
        product: true,
      },
    },
  },
});

// Get users with pagination
const users = await prisma.user.findMany({
  skip: (page - 1) * limit,
  take: limit,
  where: {
    role: 'BUYER',
    isActive: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

#### Product Queries
```typescript
// Get products by category
const products = await prisma.product.findMany({
  where: {
    categoryId: categoryId,
    isActive: true,
  },
  include: {
    category: true,
    brand: true,
  },
});

// Search products
const searchResults = await prisma.product.findMany({
  where: {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ],
    isActive: true,
  },
  include: {
    category: true,
    brand: true,
  },
});
```

#### Auction Queries
```typescript
// Get live auctions
const liveAuctions = await prisma.auction.findMany({
  where: {
    status: 'LIVE',
    endTime: { gt: new Date() },
  },
  include: {
    user: true,
    listing: {
      include: {
        category: true,
        brand: true,
        product: true,
      },
    },
    bids: {
      include: {
        user: true,
      },
      orderBy: {
        amount: 'desc',
      },
    },
  },
});
```

#### Offer Queries
```typescript
// Get offers for a requirement
const offers = await prisma.offer.findMany({
  where: {
    requirementId: requirementId,
    offerStatus: 'PENDING',
  },
  include: {
    offerUser: true,
    requirement: {
      include: {
        user: true,
        category: true,
        brand: true,
        product: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

## Database Performance Optimization

### Query Optimization

#### Use Select for Specific Fields
```typescript
// Instead of selecting all fields
const users = await prisma.user.findMany();

// Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    companyName: true,
  },
});
```

#### Use Include Strategically
```typescript
// Include only necessary relations
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    addresses: true,
    kyc: true,
    // Don't include heavy relations unless needed
  },
});
```

#### Implement Pagination
```typescript
// Use cursor-based pagination for large datasets
const users = await prisma.user.findMany({
  take: limit,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { id: 'asc' },
});
```

### Database Indexing Strategy

#### Add Indexes for Common Queries
```sql
-- User queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_active ON users(role, isActive);
CREATE INDEX idx_users_created_at ON users(createdAt);

-- Listing queries
CREATE INDEX idx_listings_user_status ON listings(userId, status);
CREATE INDEX idx_listings_category_active ON listings(categoryId, isActive);
CREATE INDEX idx_listings_created_at ON listings(createdAt);

-- Auction queries
CREATE INDEX idx_auctions_status_end_time ON auctions(status, endTime);
CREATE INDEX idx_bids_auction_user ON bids(auctionId, userId);

-- Offer queries
CREATE INDEX idx_offers_status_created ON offers(offerStatus, createdAt);
CREATE INDEX idx_offers_requirement_status ON offers(requirementId, offerStatus);
```

## Database Backup and Recovery

### Backup Strategy

```bash
# Create database backup
pg_dump -h localhost -U username -d nexg_petrolube > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql -h localhost -U username -d nexg_petrolube < backup_file.sql
```

### Automated Backups

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="nexg_petrolube"

pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

## File Management

### Upload Management

#### Uploads Table
```prisma
model Upload {
  id          String   @id @default(cuid())
  filename    String
  originalName String
  mimeType    String
  size        Int
  path        String   // S3 key for file storage
  url         String   // Complete S3 URL
  uploadedBy  String
  uploadedAt  DateTime @default(now())
  description String?
  tags        String[] @default([])
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("uploads")
}
```

**Key Features**:
- **S3 Integration**: `path` field stores S3 key, `url` field stores complete S3 URL
- **Metadata Tracking**: File descriptions, tags, and upload history
- **Access Control**: Track who uploaded what files
- **Soft Delete**: `isActive` flag for file management

**Usage Example**:
```typescript
// Create upload record
const upload = await prisma.upload.create({
  data: {
    filename: 'uuid-generated-filename.jpg',
    originalName: 'product-image.jpg',
    mimeType: 'image/jpeg',
    size: 1024000,
    path: 'uploads/uuid-generated-filename.jpg', // S3 key
    url: 'https://bucket.s3.region.amazonaws.com/uploads/uuid-generated-filename.jpg',
    uploadedBy: 'admin-id',
    description: 'Product image',
    tags: ['product', 'image'],
  },
});

// Query uploads with filters
const uploads = await prisma.upload.findMany({
  where: {
    isActive: true,
    tags: { hasSome: ['product'] },
  },
  orderBy: { createdAt: 'desc' },
});
```

## Database Monitoring

### Query Performance Monitoring

```typescript
// Enable query logging in development
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Monitor slow queries
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Log queries taking more than 1 second
    console.log('Slow query:', e.query, 'Duration:', e.duration);
  }
});
```

### Database Health Checks

```typescript
// Health check endpoint
@Get('health/database')
async checkDatabaseHealth() {
  try {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

---

*This database schema and Prisma documentation provides comprehensive information about the database structure, relationships, migrations, and optimization strategies for the NexGPetrolube Backend API.*
