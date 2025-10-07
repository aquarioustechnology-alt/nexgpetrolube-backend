# API Endpoints Documentation

## Overview

The NexGPetrolube Backend API provides comprehensive RESTful endpoints for the B2B petroleum platform. This documentation covers all available endpoints, request/response formats, authentication requirements, and usage examples.

## Base Configuration

- **Base URL**: `http://localhost:8000/api/v1`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json`
- **API Version**: v1

## Authentication Endpoints

### User Authentication

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "BUYER",
    "kycStatus": "APPROVED"
  }
}
```

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "companyName": "ABC Corp",
  "phone": "+91-9876543210",
  "role": "SELLER"
}
```

#### Admin Login
```http
POST /api/v1/auth/admin/login
Content-Type: application/json

{
  "email": "admin@nexgpetrolube.com",
  "password": "Admin@123"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer <access_token>
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

#### Get Current User Profile
```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

### OTP Verification

#### Send OTP
```http
POST /api/v1/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "EMAIL_VERIFICATION"
}
```

#### Verify OTP
```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Password Management

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify Reset OTP
```http
POST /api/v1/auth/verify-reset-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Reset Password
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

## User Management Endpoints

### User Operations

#### Get All Users (Admin)
```http
GET /api/v1/users?page=1&limit=10&search=john&role=BUYER&kycStatus=APPROVED
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for name, email, company
- `role`: Filter by role (BUYER, SELLER, BOTH)
- `kycStatus`: Filter by KYC status (NOT_SUBMITTED, PENDING, APPROVED, REJECTED)

**Response**:
```json
{
  "data": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "companyName": "ABC Corp",
      "phone": "+91-9876543210",
      "role": "BUYER",
      "kycStatus": "APPROVED",
      "isActive": true,
      "isEmailVerified": true,
      "isPhoneVerified": true,
      "profileImage": "/uploads/profile/user-123.jpg",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Create User (Admin)
```http
POST /api/v1/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "companyName": "XYZ Ltd",
  "phone": "+91-9876543210",
  "role": "SELLER",
  "address": {
    "line1": "456 Seller St",
    "city": "Delhi",
    "state": "Delhi",
    "country": "India",
    "pincode": "110001"
  }
}
```

#### Get User by ID (Admin)
```http
GET /api/v1/users/{userId}
Authorization: Bearer <admin_token>
```

#### Update User (Admin)
```http
PATCH /api/v1/users/{userId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "Jane Updated",
  "companyName": "XYZ Ltd Updated",
  "phone": "+91-9876543211"
}
```

#### Delete User (Admin)
```http
DELETE /api/v1/users/{userId}
Authorization: Bearer <admin_token>
```

#### Get User Profile
```http
GET /api/v1/users/profile
Authorization: Bearer <user_token>
```

#### Get User Statistics (Admin)
```http
GET /api/v1/users/stats
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "totalUsers": 150,
  "activeUsers": 120,
  "pendingKyc": 25,
  "rejectedKyc": 5,
  "buyers": 80,
  "sellers": 50,
  "both": 20
}
```

## KYC Management Endpoints

### KYC Operations

#### Submit KYC Documents
```http
POST /api/v1/users/kyc-submission
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "panNumber": "ABCDE1234F",
  "aadhaarNumber": "123456789012",
  "gstNumber": "27AABCU9603R1ZX",
  "yearsInBusiness": 5,
  "documents": [
    {
      "type": "PAN_CARD",
      "fileName": "pan-card.pdf",
      "fileUrl": "/uploads/kyc/pan-card-123.pdf"
    },
    {
      "type": "GST_CERTIFICATE",
      "fileName": "gst-cert.pdf",
      "fileUrl": "/uploads/kyc/gst-cert-123.pdf"
    }
  ]
}
```

#### Get KYC Submissions (Admin)
```http
GET /api/v1/admin/kyc?page=1&limit=10&kycStatus=PENDING&role=BUYER&search=company
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "data": [
    {
      "id": "kyc-123",
      "userId": "user-123",
      "companyName": "ABC Corp",
      "gstNumber": "27AABCU9603R1ZX",
      "panNumber": "ABCDE1234F",
      "aadhaarNumber": "123456789012",
      "kycStatus": "PENDING",
      "submittedAt": "2024-01-10T10:00:00Z",
      "reviewedAt": null,
      "reviewedBy": null,
      "rejectionReason": null,
      "documents": [
        {
          "id": "doc-123",
          "documentType": "GST_CERTIFICATE",
          "fileName": "gst-cert.pdf",
          "fileUrl": "/uploads/kyc/gst-cert-123.pdf",
          "uploadedAt": "2024-01-10T10:00:00Z"
        }
      ],
      "user": {
        "id": "user-123",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "companyName": "ABC Corp",
        "role": "BUYER"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Approve KYC (Admin)
```http
POST /api/v1/admin/kyc/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "kycId": "kyc-123",
  "notes": "All documents verified successfully"
}
```

#### Reject KYC (Admin)
```http
POST /api/v1/admin/kyc/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "kycId": "kyc-123",
  "reason": "Invalid GST number",
  "notes": "Please provide correct GST certificate"
}
```

#### Update KYC Status (Admin)
```http
PATCH /api/v1/users/{userId}/kyc-status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "APPROVED",
  "reason": "Documents verified"
}
```

## Product Management Endpoints

### Categories

#### Get Categories
```http
GET /api/v1/categories
Authorization: Bearer <token>
```

#### Get Subcategories
```http
GET /api/v1/categories/{categoryId}/subcategories
Authorization: Bearer <token>
```

#### Create Category (Admin)
```http
POST /api/v1/admin/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Industrial Lubricants",
  "description": "Lubricants for industrial applications",
  "isActive": true
}
```

#### Update Category (Admin)
```http
PUT /api/v1/admin/categories/{categoryId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Category Name",
  "description": "Updated description"
}
```

#### Delete Category (Admin)
```http
DELETE /api/v1/admin/categories/{categoryId}
Authorization: Bearer <admin_token>
```

### Brands

#### Get Brands
```http
GET /api/v1/brands
Authorization: Bearer <token>
```

#### Create Brand (Admin)
```http
POST /api/v1/admin/brands
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Shell",
  "description": "Shell lubricants",
  "logo": "/uploads/brands/shell-logo.png",
  "isActive": true
}
```

### Products

#### Get Products
```http
GET /api/v1/products?categoryId=cat-123&brandId=brand-123&search=oil
Authorization: Bearer <token>
```

#### Get Product Specifications
```http
GET /api/v1/products/{productId}/specifications
Authorization: Bearer <token>
```

#### Create Product (Admin)
```http
POST /api/v1/admin/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Engine Oil 15W-40",
  "description": "High-performance engine oil",
  "categoryId": "cat-123",
  "brandId": "brand-123",
  "specifications": {
    "viscosity": "15W-40",
    "type": "Mineral",
    "capacity": "4L"
  },
  "isActive": true
}
```

## Requirements Management Endpoints

### Requirements

#### Get Requirements
```http
GET /api/v1/requirements?page=1&limit=10&status=PENDING&userType=BUYER&search=oil
Authorization: Bearer <token>
```

#### Create Requirement
```http
POST /api/v1/requirements
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "title": "Engine Oil Requirement",
  "shortDescription": "High-quality engine oil for industrial use",
  "detailedDescription": "We require premium grade engine oil...",
  "categoryId": "cat-123",
  "productId": "prod-123",
  "brandId": "brand-123",
  "quantity": 1000,
  "units": "LITERS",
  "unitPrice": 150.00,
  "totalBudget": 150000.00,
  "postingType": "REQUIREMENT",
  "negotiableType": "NEGOTIABLE",
  "visibility": "PUBLIC",
  "userType": "BUYER"
}
```

#### Get Requirement by ID
```http
GET /api/v1/requirements/{requirementId}
Authorization: Bearer <token>
```

#### Update Requirement
```http
PUT /api/v1/requirements/{requirementId}
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "title": "Updated Requirement Title",
  "quantity": 1200,
  "unitPrice": 160.00
}
```

#### Delete Requirement
```http
DELETE /api/v1/requirements/{requirementId}
Authorization: Bearer <user_token>
```

### Requirements Dropdown Data

#### Get Categories for Requirements
```http
GET /api/v1/requirements/dropdowns/categories
Authorization: Bearer <token>
```

#### Get Subcategories
```http
GET /api/v1/requirements/dropdowns/subcategories/{categoryId}
Authorization: Bearer <token>
```

#### Get Products
```http
GET /api/v1/requirements/dropdowns/products/{categoryId}
Authorization: Bearer <token>
```

#### Get Brands
```http
GET /api/v1/requirements/dropdowns/brands
Authorization: Bearer <token>
```

### Admin Requirements Management

#### Get Requirements (Admin)
```http
GET /api/v1/admin/requirements?page=1&limit=10&status=PENDING&adminStatus=PENDING&userType=BUYER&search=oil
Authorization: Bearer <admin_token>
```

#### Approve Requirement (Admin)
```http
POST /api/v1/admin/requirements/{requirementId}/approve
Authorization: Bearer <admin_token>
Content-Type: application/json

{}
```

#### Reject Requirement (Admin)
```http
POST /api/v1/admin/requirements/{requirementId}/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "rejectionReason": "Incomplete product specifications"
}
```

#### Get Requirements Statistics (Admin)
```http
GET /api/v1/admin/requirements/stats/overview?userType=BUYER
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "total": 150,
  "pending": 25,
  "approved": 100,
  "rejected": 15,
  "draft": 5,
  "open": 80,
  "closed": 20
}
```

## Offers Management Endpoints

### Listing Offers

#### Get Listing Offers
```http
GET /api/v1/offers/listing?page=1&limit=10&offerStatus=PENDING&listingOwnerType=SELLER&isCounterOffer=false
Authorization: Bearer <token>
```

#### Create Listing Offer
```http
POST /api/v1/offers/listing
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "requirementId": "req-123",
  "price": 120.00,
  "quantity": 500,
  "negotiableType": "NEGOTIABLE",
  "validUntil": "2024-01-20T10:00:00Z",
  "notes": "Best quality product"
}
```

#### Accept Offer
```http
POST /api/v1/offers/listing/{offerId}/accept
Authorization: Bearer <user_token>
```

#### Reject Offer
```http
POST /api/v1/offers/listing/{offerId}/reject
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "reason": "Price too high"
}
```

### Requirement Offers

#### Get Requirement Offers
```http
GET /api/v1/offers/requirement?page=1&limit=10&offerStatus=PENDING&requirementOwnerType=BUYER&isCounterOffer=false
Authorization: Bearer <token>
```

#### Create Requirement Offer
```http
POST /api/v1/offers/requirement
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "requirementId": "req-123",
  "price": 120.00,
  "quantity": 500,
  "negotiableType": "NEGOTIABLE",
  "validUntil": "2024-01-20T10:00:00Z",
  "notes": "Can deliver within timeline"
}
```

### Admin Offers Management

#### Get Listing Offers (Admin)
```http
GET /api/v1/admin/listing-offers?page=1&limit=10&offerStatus=PENDING&listingOwnerType=SELLER&isCounterOffer=false
Authorization: Bearer <admin_token>
```

#### Get Requirement Offers (Admin)
```http
GET /api/v1/admin/requirement-offers?page=1&limit=10&offerStatus=PENDING&requirementOwnerType=BUYER&isCounterOffer=false
Authorization: Bearer <admin_token>
```

#### Accept Offer (Admin)
```http
POST /api/v1/admin/listing-offers/{offerId}/accept
Authorization: Bearer <admin_token>
```

#### Reject Offer (Admin)
```http
POST /api/v1/admin/listing-offers/{offerId}/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Price too high"
}
```

## Auction Management Endpoints

### Auctions

#### Get Auctions
```http
GET /api/v1/auctions?page=1&limit=10&status=LIVE&type=TRADITIONAL&search=oil
Authorization: Bearer <token>
```

#### Create Auction
```http
POST /api/v1/auctions
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "title": "Engine Oil Auction",
  "description": "Premium engine oil auction",
  "type": "TRADITIONAL",
  "listingId": "listing-123",
  "startingPrice": 100.00,
  "reservePrice": 150.00,
  "bidIncrement": 5.00,
  "startTime": "2024-01-20T10:00:00Z",
  "endTime": "2024-01-20T18:00:00Z",
  "duration": 480
}
```

#### Get Auction by ID
```http
GET /api/v1/auctions/{auctionId}
Authorization: Bearer <token>
```

#### Update Auction
```http
PUT /api/v1/auctions/{auctionId}
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "title": "Updated Auction Title",
  "reservePrice": 160.00
}
```

#### End Auction
```http
POST /api/v1/auctions/{auctionId}/end
Authorization: Bearer <user_token>
```

### Bids

#### Get Bids for Auction
```http
GET /api/v1/auctions/{auctionId}/bids
Authorization: Bearer <token>
```

#### Place Bid
```http
POST /api/v1/auctions/{auctionId}/bids
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "amount": 125.00,
  "autoBid": false,
  "maxBid": 200.00
}
```

#### Get User Bids
```http
GET /api/v1/bids?userId=user-123&auctionId=auction-123&status=ACTIVE
Authorization: Bearer <token>
```

## File Upload Endpoints

### Upload Files

#### Single File Upload
```http
POST /api/v1/upload/single
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [binary file data]
type: "kyc" | "profile" | "product" | "listing"
```

**Response**:
```json
{
  "filename": "document-123.pdf",
  "url": "/uploads/kyc/document-123.pdf",
  "size": 1024000,
  "mimeType": "application/pdf"
}
```

#### Multiple Files Upload
```http
POST /api/v1/upload/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [binary file data array]
type: "kyc" | "listing" | "product"
```

## Notification Endpoints

### Notifications

#### Get User Notifications
```http
GET /api/v1/notifications?page=1&limit=10&type=OFFER&isRead=false
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
PATCH /api/v1/notifications/{notificationId}/read
Authorization: Bearer <token>
```

#### Mark All Notifications as Read
```http
PATCH /api/v1/notifications/read-all
Authorization: Bearer <token>
```

#### Delete Notification
```http
DELETE /api/v1/notifications/{notificationId}
Authorization: Bearer <token>
```

## Payment Endpoints

### Payments

#### Create Payment
```http
POST /api/v1/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 15000.00,
  "currency": "INR",
  "paymentMethod": "STRIPE",
  "orderId": "order-123",
  "description": "Payment for requirement offer"
}
```

#### Get Payment Status
```http
GET /api/v1/payments/{paymentId}
Authorization: Bearer <token>
```

#### Update Payment Status
```http
PATCH /api/v1/payments/{paymentId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "transactionId": "txn_123456789"
}
```

## Logistics Endpoints

### Logistics

#### Get Logistics by Offer ID
```http
GET /api/v1/logistics/offer/{offerId}
Authorization: Bearer <token>
```

#### Create Logistics
```http
POST /api/v1/logistics
Authorization: Bearer <token>
Content-Type: application/json

{
  "offerId": "offer-123",
  "transportation": "ROAD",
  "deliveryDate": "2024-01-25T10:00:00Z",
  "pickupAddress": {
    "line1": "123 Seller St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "deliveryAddress": {
    "line1": "456 Buyer St",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001"
  }
}
```

#### Update Logistics
```http
PUT /api/v1/logistics/{logisticsId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_TRANSIT",
  "trackingNumber": "TRK123456789"
}
```

## Admin Dashboard Endpoints

### Dashboard Statistics

#### Get Dashboard KPIs
```http
GET /api/v1/admin/dashboard/kpis
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "totalUsers": 150,
  "todayGmv": 250000.00,
  "liveAuctions": 5,
  "pendingKyc": 25,
  "totalListings": 200,
  "totalRequirements": 150,
  "activeOffers": 30
}
```

#### Get Recent Activity
```http
GET /api/v1/admin/dashboard/recent-activity?limit=10
Authorization: Bearer <admin_token>
```

#### Get User Statistics
```http
GET /api/v1/admin/dashboard/user-stats
Authorization: Bearer <admin_token>
```

#### Get Revenue Analytics
```http
GET /api/v1/admin/dashboard/revenue?period=30d
Authorization: Bearer <admin_token>
```

## WebSocket Events

### Real-time Communication

#### Join Auction Room
```javascript
socket.emit('join_auction', { auctionId: 'auction-123' });
```

#### Place Bid
```javascript
socket.emit('place_bid', { 
  auctionId: 'auction-123', 
  amount: 1000, 
  userId: 'user-123' 
});
```

#### Listen for Events
```javascript
socket.on('new_bid', (bid) => {
  console.log('New bid:', bid);
});

socket.on('auction_ended', (auction) => {
  console.log('Auction ended:', auction);
});

socket.on('offer_update', (offer) => {
  console.log('Offer updated:', offer);
});
```

## Error Handling

### Standard Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:00:00Z",
  "path": "/api/v1/users",
  "validationErrors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Unprocessable Entity
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

### Rate Limit Exceeded Response

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests"
}
```

## Pagination

### Standard Pagination Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Pagination Response Format

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## API Testing

### Postman Collection

A comprehensive Postman collection is available for testing all API endpoints:

1. **Authentication**: Login and token management
2. **User Management**: CRUD operations
3. **KYC Management**: Approval workflow
4. **Requirements**: Moderation workflow
5. **Offers**: Offer management
6. **Auctions**: Auction and bidding
7. **Admin**: Admin panel operations

### Testing Scripts

```bash
# Run API tests
npm run test:api

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

---

*This API endpoints documentation provides comprehensive information about all available endpoints, request/response formats, authentication requirements, and usage examples for the NexGPetrolube Backend API.*
