# Services & Business Logic Documentation

## Overview

The NexGPetrolube Backend API implements a comprehensive service layer that encapsulates business logic, data access patterns, and cross-cutting concerns. This documentation covers all services, their responsibilities, and implementation patterns.

## Service Architecture

### Service Layer Structure

```
Services/
├── AuthService                    # Authentication & authorization
├── UsersService                   # User management
├── KycService                     # KYC verification
├── ProductsService                # Product catalog
├── RequirementsService             # Requirements management
├── AuctionsService                # Auction system
├── BidsService                    # Bidding logic
├── OffersService                  # Offers management
├── QuotesService                  # Quote system
├── CategoriesService              # Categories & brands
├── NotificationsService           # Notification system
├── UploadService                  # File upload
├── PaymentsService                # Payment processing
├── LogisticsService               # Logistics management
├── AdminServices/                 # Admin-specific services
│   ├── AdminUsersService          # Admin user management
│   ├── AdminKycService            # Admin KYC review
│   ├── AdminListingsService       # Content moderation
│   ├── AdminRequirementsService   # Requirements management
│   ├── AdminDashboardService      # Analytics & KPIs
│   └── AuditService               # Activity logging
└── PrismaService                  # Database access
```

## Core Services

### 1. Authentication Service (`AuthService`)

**Purpose**: Handles user and admin authentication, JWT token management, and password operations

**Key Methods**:

```typescript
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
  ) {}

  // User authentication
  async login(loginDto: LoginDto): Promise<LoginResponse>
  async register(registerDto: RegisterDto): Promise<RegisterResponse>
  async adminLogin(adminLoginDto: AdminLoginDto): Promise<AdminLoginResponse>
  
  // Token management
  async refreshToken(userId: string, userType: string): Promise<TokenResponse>
  async logout(): Promise<void>
  
  // Password management
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void>
  async verifyResetOtp(verifyResetOtpDto: VerifyResetOtpDto): Promise<void>
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void>
  
  // User details
  async getUserDetails(userId: string): Promise<UserDetailsResponse>
  async updateUserDetails(userId: string, updateDto: UpdateUserDetailsDto): Promise<UserDetailsResponse>
  
  // Validation
  async validateUser(userId: string): Promise<User>
  async validateAdmin(adminId: string): Promise<Admin>
}
```

**Usage Example**:
```typescript
// Login user
const loginResponse = await this.authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Generate JWT tokens
const tokens = await this.authService.generateTokens(userId, 'USER');

// Validate user
const user = await this.authService.validateUser(userId);
```

### 2. Users Service (`UsersService`)

**Purpose**: User lifecycle management, profile operations, and user-related business logic

**Key Methods**:

```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // User CRUD operations
  async create(createUserDto: CreateUserDto): Promise<User>
  async findAll(page: number, limit: number, search?: string, role?: string): Promise<PaginatedUserResponse>
  async findOne(id: string): Promise<User>
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User>
  async remove(id: string): Promise<void>
  
  // Profile management
  async getUserDetails(userId: string): Promise<UserDetailsResponse>
  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<User>
  
  // KYC operations
  async submitKyc(userId: string, kycData: KycSubmissionDto): Promise<Kyc>
  async updateKycStatus(userId: string, status: KycStatus, reason?: string): Promise<Kyc>
  
  // User statistics
  async getStats(): Promise<UserStats>
  async getUserActivity(userId: string): Promise<UserActivity[]>
  
  // Address management
  async addAddress(userId: string, addressData: CreateAddressDto): Promise<Address>
  async updateAddress(userId: string, addressId: string, addressData: UpdateAddressDto): Promise<Address>
  async deleteAddress(userId: string, addressId: string): Promise<void>
}
```

**Usage Example**:
```typescript
// Create user
const user = await this.usersService.create({
  email: 'newuser@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  companyName: 'ABC Corp',
  role: 'BUYER'
});

// Get user with pagination
const users = await this.usersService.findAll(1, 10, 'john', 'BUYER');

// Submit KYC
const kyc = await this.usersService.submitKyc(userId, {
  panNumber: 'ABCDE1234F',
  gstNumber: '27AABCU9603R1ZX',
  documents: [...]
});
```

### 3. KYC Service (`KycService`)

**Purpose**: KYC document verification, approval workflow, and compliance management

**Key Methods**:

```typescript
@Injectable()
export class KycService {
  constructor(private prisma: PrismaService) {}

  // KYC submission management
  async submitKyc(userId: string, kycData: KycSubmissionDto): Promise<Kyc>
  async getKycByUserId(userId: string): Promise<Kyc>
  async updateKycStatus(kycId: string, status: KycStatus, reason?: string): Promise<Kyc>
  
  // Document management
  async addDocument(kycId: string, documentData: CreateKycDocumentDto): Promise<KycDocument>
  async removeDocument(documentId: string): Promise<void>
  async getDocuments(kycId: string): Promise<KycDocument[]>
  
  // Admin operations
  async getKycSubmissions(page: number, limit: number, filters?: KycFilters): Promise<PaginatedKycResponse>
  async approveKyc(kycId: string, notes?: string): Promise<Kyc>
  async rejectKyc(kycId: string, reason: string, notes?: string): Promise<Kyc>
  
  // Statistics
  async getKycStats(): Promise<KycStats>
  async getPendingKycCount(): Promise<number>
}
```

**Usage Example**:
```typescript
// Submit KYC documents
const kyc = await this.kycService.submitKyc(userId, {
  panNumber: 'ABCDE1234F',
  aadhaarNumber: '123456789012',
  gstNumber: '27AABCU9603R1ZX',
  yearsInBusiness: 5,
  documents: [
    {
      type: 'PAN_CARD',
      fileName: 'pan-card.pdf',
      fileUrl: '/uploads/kyc/pan-card-123.pdf'
    }
  ]
});

// Approve KYC
await this.kycService.approveKyc(kycId, 'All documents verified successfully');

// Get KYC statistics
const stats = await this.kycService.getKycStats();
```

### 4. Products Service (`ProductsService`)

**Purpose**: Product catalog management, specifications, and product-related operations

**Key Methods**:

```typescript
@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Product CRUD operations
  async create(createProductDto: CreateProductDto): Promise<Product>
  async findAll(filters?: ProductFilters): Promise<Product[]>
  async findOne(id: string): Promise<Product>
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product>
  async remove(id: string): Promise<void>
  
  // Product specifications
  async getSpecifications(productId: string): Promise<ProductSpecifications>
  async updateSpecifications(productId: string, specifications: any): Promise<Product>
  
  // Category and brand relationships
  async getProductsByCategory(categoryId: string): Promise<Product[]>
  async getProductsByBrand(brandId: string): Promise<Product[]>
  
  // Search and filtering
  async searchProducts(query: string, filters?: ProductFilters): Promise<Product[]>
  async getFeaturedProducts(): Promise<Product[]>
  
  // Admin operations
  async getProductStats(): Promise<ProductStats>
  async bulkUpdateProducts(updates: BulkProductUpdate[]): Promise<void>
}
```

**Usage Example**:
```typescript
// Create product
const product = await this.productsService.create({
  name: 'Engine Oil 15W-40',
  description: 'High-performance engine oil',
  categoryId: 'cat-123',
  brandId: 'brand-123',
  specifications: {
    viscosity: '15W-40',
    type: 'Mineral',
    capacity: '4L'
  }
});

// Get products by category
const products = await this.productsService.getProductsByCategory('cat-123');

// Search products
const searchResults = await this.productsService.searchProducts('engine oil', {
  categoryId: 'cat-123',
  brandId: 'brand-123'
});
```

### 5. Requirements Service (`RequirementsService`)

**Purpose**: Buyer requirements management, quote system, and requirement lifecycle

**Key Methods**:

```typescript
@Injectable()
export class RequirementsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Requirement CRUD operations
  async create(userId: string, createRequirementDto: CreateRequirementDto): Promise<Requirement>
  async findAll(filters?: RequirementFilters): Promise<Requirement[]>
  async findOne(id: string): Promise<Requirement>
  async update(id: string, userId: string, updateRequirementDto: UpdateRequirementDto): Promise<Requirement>
  async remove(id: string, userId: string): Promise<void>
  
  // Requirement lifecycle
  async publishRequirement(requirementId: string, userId: string): Promise<Requirement>
  async closeRequirement(requirementId: string, userId: string): Promise<Requirement>
  async reopenRequirement(requirementId: string, userId: string): Promise<Requirement>
  
  // Quote management
  async submitQuote(requirementId: string, userId: string, quoteData: CreateQuoteDto): Promise<Quote>
  async getQuotesForRequirement(requirementId: string): Promise<Quote[]>
  async acceptQuote(quoteId: string, userId: string): Promise<Quote>
  async rejectQuote(quoteId: string, userId: string, reason: string): Promise<Quote>
  
  // Dropdown data
  async getCategories(): Promise<Category[]>
  async getSubcategories(categoryId: string): Promise<Subcategory[]>
  async getProducts(categoryId: string): Promise<Product[]>
  async getBrands(): Promise<Brand[]>
  
  // Statistics
  async getRequirementStats(userId?: string): Promise<RequirementStats>
  async getUserRequirements(userId: string): Promise<Requirement[]>
}
```

**Usage Example**:
```typescript
// Create requirement
const requirement = await this.requirementsService.create(userId, {
  title: 'Engine Oil Requirement',
  shortDescription: 'High-quality engine oil for industrial use',
  detailedDescription: 'We require premium grade engine oil...',
  categoryId: 'cat-123',
  productId: 'prod-123',
  brandId: 'brand-123',
  quantity: 1000,
  units: 'LITERS',
  unitPrice: 150.00,
  postingType: 'REQUIREMENT',
  negotiableType: 'NEGOTIABLE'
});

// Submit quote
const quote = await this.requirementsService.submitQuote(requirementId, userId, {
  price: 140.00,
  quantity: 1000,
  deliveryTime: '7 days',
  notes: 'Best quality product'
});

// Get dropdown data
const categories = await this.requirementsService.getCategories();
const subcategories = await this.requirementsService.getSubcategories('cat-123');
```

### 6. Auctions Service (`AuctionsService`)

**Purpose**: Auction management, scheduling, and auction lifecycle operations

**Key Methods**:

```typescript
@Injectable()
export class AuctionsService {
  constructor(
    private prisma: PrismaService,
    private websocketGateway: WebsocketGateway,
    private notificationsService: NotificationsService,
  ) {}

  // Auction CRUD operations
  async create(userId: string, createAuctionDto: CreateAuctionDto): Promise<Auction>
  async findAll(filters?: AuctionFilters): Promise<Auction[]>
  async findOne(id: string): Promise<Auction>
  async update(id: string, userId: string, updateAuctionDto: UpdateAuctionDto): Promise<Auction>
  async remove(id: string, userId: string): Promise<void>
  
  // Auction lifecycle
  async startAuction(auctionId: string): Promise<Auction>
  async pauseAuction(auctionId: string): Promise<Auction>
  async resumeAuction(auctionId: string): Promise<Auction>
  async endAuction(auctionId: string): Promise<Auction>
  
  // Bidding management
  async placeBid(auctionId: string, userId: string, bidData: CreateBidDto): Promise<Bid>
  async getBidsForAuction(auctionId: string): Promise<Bid[]>
  async getUserBids(userId: string): Promise<Bid[]>
  
  // Real-time operations
  async broadcastNewBid(auctionId: string, bid: Bid): Promise<void>
  async broadcastAuctionUpdate(auctionId: string, update: AuctionUpdate): Promise<void>
  
  // Statistics
  async getAuctionStats(): Promise<AuctionStats>
  async getUserAuctionStats(userId: string): Promise<UserAuctionStats>
}
```

**Usage Example**:
```typescript
// Create auction
const auction = await this.auctionsService.create(userId, {
  title: 'Engine Oil Auction',
  description: 'Premium engine oil auction',
  type: 'TRADITIONAL',
  listingId: 'listing-123',
  startingPrice: 100.00,
  reservePrice: 150.00,
  bidIncrement: 5.00,
  startTime: new Date('2024-01-20T10:00:00Z'),
  endTime: new Date('2024-01-20T18:00:00Z')
});

// Place bid
const bid = await this.auctionsService.placeBid(auctionId, userId, {
  amount: 125.00,
  autoBid: false,
  maxBid: 200.00
});

// End auction
await this.auctionsService.endAuction(auctionId);
```

### 7. Offers Service (`OffersService`)

**Purpose**: Offer management for listings and requirements, negotiation workflow

**Key Methods**:

```typescript
@Injectable()
export class OffersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Listing offers
  async createListingOffer(userId: string, createOfferDto: CreateListingOfferDto): Promise<Offer>
  async getListingOffers(filters?: ListingOfferFilters): Promise<Offer[]>
  async acceptListingOffer(offerId: string, userId: string): Promise<Offer>
  async rejectListingOffer(offerId: string, userId: string, reason: string): Promise<Offer>
  
  // Requirement offers
  async createRequirementOffer(userId: string, createOfferDto: CreateRequirementOfferDto): Promise<Offer>
  async getRequirementOffers(filters?: RequirementOfferFilters): Promise<Offer[]>
  async acceptRequirementOffer(offerId: string, userId: string): Promise<Offer>
  async rejectRequirementOffer(offerId: string, userId: string, reason: string): Promise<Offer>
  
  // Counter offers
  async createCounterOffer(offerId: string, userId: string, counterOfferData: CreateCounterOfferDto): Promise<Offer>
  async getCounterOffers(originalOfferId: string): Promise<Offer[]>
  
  // Offer negotiation
  async updateOffer(offerId: string, userId: string, updateData: UpdateOfferDto): Promise<Offer>
  async withdrawOffer(offerId: string, userId: string): Promise<void>
  
  // Statistics
  async getOfferStats(userId?: string): Promise<OfferStats>
  async getUserOffers(userId: string): Promise<Offer[]>
}

// Negotiation Window Expiry Service
@Injectable()
export class OffersCronService {
  constructor(private prisma: PrismaService) {}
  
  // Runs every 5 minutes to auto-expire offers that have passed their negotiation window
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredOffers(): Promise<void>
}
```

**Usage Example**:
```typescript
// Create listing offer
const offer = await this.offersService.createListingOffer(userId, {
  requirementId: 'req-123',
  price: 120.00,
  quantity: 500,
  negotiableType: 'NEGOTIABLE',
  validUntil: new Date('2024-01-20T10:00:00Z'),
  notes: 'Best quality product'
});

// Accept offer
await this.offersService.acceptListingOffer(offerId, userId);

// Create counter offer
const counterOffer = await this.offersService.createCounterOffer(offerId, userId, {
  price: 115.00,
  quantity: 500,
  notes: 'Counter offer with better price'
});
```

**Negotiation Window Feature**:

The negotiation window feature automatically manages offer expiration for negotiable requirements:

1. **When an offer is created** on a negotiable requirement:
   - The `offerExpiryDate` is automatically calculated based on the requirement's `negotiationWindow` value
   - Example: If negotiationWindow is 12 hours and offer is placed at 11:30 AM, expiry is set to 11:30 PM

2. **During negotiation**:
   - Users can accept, reject, or counter the offer within the negotiation window
   - Counter offers inherit the same expiry date as the original offer
   - The system checks expiry before allowing any action (accept/counter)

3. **After expiry**:
   - Offers are automatically marked as `EXPIRED` by the cron job (runs every 5 minutes)
   - API calls to accept or counter expired offers are rejected with an error message
   - Frontend displays "Expired" status and disables all action buttons

4. **Cron Job**:
   - Runs every 5 minutes using `@Cron(CronExpression.EVERY_5_MINUTES)`
   - Finds all pending negotiable offers with expired `offerExpiryDate`
   - Updates their status to `EXPIRED`
   - Logs the expiration details for monitoring

### 8. Bids Service (`BidsService`)

**Purpose**: Bid management, bidding operations, and bid lifecycle management

**Key Methods**:

```typescript
@Injectable()
export class BidsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Bid CRUD operations
  async create(createBidDto: CreateBidDto): Promise<Bid>
  async findAll(filters?: BidFilters): Promise<Bid[]>
  async findOne(id: string): Promise<Bid>
  async getBidsByRequirement(requirementId: string): Promise<Bid[]>
  async getBidById(id: string): Promise<Bid>
  async getBidResults(requirementId: string): Promise<Bid[]>
  
  // Bid actions
  async acceptBid(bidId: string, userId: string, notes?: string): Promise<{ message: string; bid: Bid }>
  async rejectBid(bidId: string, userId: string, reason?: string): Promise<{ message: string; bid: Bid }>
  async allocateBids(requirementId: string, allocations: { [bidId: string]: number }, userId: string, quantities?: { [bidId: string]: number }): Promise<{ message: string; allocatedBids: Bid[] }>
  
  // Bid validation
  private validateBidCreation(createBidDto: CreateBidDto): Promise<void>
  private validateBidAcceptance(bid: Bid, userId: string): Promise<void>
  private validateBidAllocation(requirementId: string, allocations: { [bidId: string]: number }, userId: string): Promise<void>
  
  // Bid status management
  private updateBidStatus(bidId: string, status: BidStatus): Promise<Bid>
  private updateOtherBidsStatus(requirementId: string, winningBidId: string): Promise<void>
  
  // Statistics
  async getBidStats(userId?: string): Promise<BidStats>
  async getUserBids(userId: string): Promise<Bid[]>
}
```

**Usage Example**:
```typescript
// Create bid
const bid = await this.bidsService.create({
  requirementId: 'req-123',
  amount: '125.50',
  quantity: '1000',
  notes: 'Can deliver within 7 days',
  negotiationWindow: 24,
  deliveryTerms: 'FOB',
  paymentTerms: '30 days credit'
});

// Accept bid
const result = await this.bidsService.acceptBid(bidId, userId, 'Bid accepted - looking forward to working with you');

// Allocate bids to multiple suppliers
const allocationResult = await this.bidsService.allocateBids(requirementId, {
  'bid-123': 50,
  'bid-456': 30,
  'bid-789': 20
}, userId, {
  'bid-123': 500,
  'bid-456': 300,
  'bid-789': 200
});

// Get bid results
const results = await this.bidsService.getBidResults(requirementId);
```

**Key Features**:
- **Bid Creation**: Create bids for requirements with validation
- **Bid Acceptance**: Accept bids with automatic status updates
- **Bid Rejection**: Reject bids with reason tracking
- **Multi-Supplier Allocation**: Allocate bids to multiple suppliers with percentage distribution
- **Bid Results**: Get sorted bid results for requirements
- **Status Management**: Automatic status updates for bid lifecycle
- **Validation**: Comprehensive validation for bid operations
- **Authorization**: Ensure only requirement owners can accept/reject/allocate bids

### 9. Notifications Service (`NotificationsService`)

**Purpose**: Notification management, delivery, and user communication

**Key Methods**:

```typescript
@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  // Notification CRUD operations
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification>
  async findAll(userId: string, filters?: NotificationFilters): Promise<Notification[]>
  async findOne(id: string): Promise<Notification>
  async markAsRead(notificationId: string, userId: string): Promise<Notification>
  async markAllAsRead(userId: string): Promise<void>
  async remove(notificationId: string, userId: string): Promise<void>
  
  // Notification types
  async createOfferNotification(offerId: string, type: OfferNotificationType): Promise<void>
  async createAuctionNotification(auctionId: string, type: AuctionNotificationType): Promise<void>
  async createKycNotification(userId: string, type: KycNotificationType): Promise<void>
  async createSystemNotification(message: string, userIds?: string[]): Promise<void>
  
  // Delivery methods
  async sendEmailNotification(userId: string, template: string, data: any): Promise<void>
  async sendSmsNotification(userId: string, message: string): Promise<void>
  async sendPushNotification(userId: string, title: string, body: string): Promise<void>
  
  // Statistics
  async getNotificationStats(userId: string): Promise<NotificationStats>
  async getUnreadCount(userId: string): Promise<number>
}
```

**Usage Example**:
```typescript
// Create notification
const notification = await this.notificationsService.create({
  userId: 'user-123',
  type: 'OFFER_RECEIVED',
  title: 'New Offer Received',
  message: 'You have received a new offer for your listing',
  data: { offerId: 'offer-123' }
});

// Send email notification
await this.notificationsService.sendEmailNotification(userId, 'offer-received', {
  offerId: 'offer-123',
  price: 120.00,
  sellerName: 'John Doe'
});

// Mark as read
await this.notificationsService.markAsRead(notificationId, userId);
```

### 10. Profile Service (`ProfileService`)

**Purpose**: User profile management, KYC, addresses, payment methods, and transactions

**Key Methods**:

```typescript
@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  // Profile management
  async getProfile(userId: string): Promise<ProfileResponseDto>
  async updatePersonalInfo(userId: string, updateData: UpdatePersonalInfoDTO): Promise<ProfileResponseDto>
  async updateKyc(userId: string, updateData: UpdateKycDto): Promise<ProfileResponseDto>
  
  // Address management
  async createAddress(userId: string, createData: UpdateAddressDto): Promise<ProfileResponseDto>
  async updateAddress(userId: string, addressId: string, updateData: UpdateAddressDto): Promise<ProfileResponseDto>
  async deleteAddress(userId: string, addressId: string): Promise<ProfileResponseDto>
  
  // Profile completion calculation
  private calculateProfileCompletion(user: any): number
}
```

**Usage Example**:
```typescript
// Get complete user profile
const profile = await this.profileService.getProfile(userId);

// Update personal information
const updatedProfile = await this.profileService.updatePersonalInfo(userId, {
  firstName: 'John',
  lastName: 'Doe',
  companyName: 'ABC Corp',
  phone: '+1234567890'
});

// Update KYC information
const kycUpdated = await this.profileService.updateKyc(userId, {
  panNumber: 'ABCDE1234F',
  aadhaarNumber: '123456789012',
  gstNumber: '27AABCU9603R1ZX',
  yearsInBusiness: 5
});

// Add new address
const addressAdded = await this.profileService.createAddress(userId, {
  type: 'COMMUNICATION',
  line1: '123 Main Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  pincode: '400001',
  isDefault: true
});
```

### 11. Payment Methods Service (`PaymentMethodsService`)

**Purpose**: Payment methods and transaction management

**Key Methods**:

```typescript
@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  // Payment methods management
  async getPaymentMethods(userId: string): Promise<PaymentMethodDto[]>
  async addPaymentMethod(userId: string, createData: CreatePaymentMethodDto): Promise<PaymentMethodDto>
  async updatePaymentMethod(userId: string, paymentMethodId: string, updateData: UpdatePaymentMethodDto): Promise<PaymentMethodDto>
  async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<void>
  
  // Transaction management
  async getTransactions(userId: string, startDate?: Date, endDate?: Date): Promise<{ transactions: TransactionDto[] }>
  async getTransactionById(userId: string, transactionId: string): Promise<TransactionDto>
}
```

**Usage Example**:
```typescript
// Get saved payment methods
const paymentMethods = await this.paymentMethodsService.getPaymentMethods(userId);

// Add new payment method
const newPaymentMethod = await this.paymentMethodsService.addPaymentMethod(userId, {
  cardNumber: '4111111111111111',
  cardHolderName: 'John Doe',
  expiryDate: '12/25',
  cvv: '123',
  isDefault: true
});

// Get transaction history
const transactions = await this.paymentMethodsService.getTransactions(userId, startDate, endDate);
```

### 12. Upload Service (`UploadService`)

**Purpose**: File upload management, storage, and file operations with AWS S3 integration

**Key Methods**:

```typescript
@Injectable()
export class UploadService {
  constructor(
    private configService: ConfigService,
  ) {}

  // File upload operations (AWS S3)
  async uploadFile(file: Express.Multer.File): Promise<UploadFileResponseDto>
  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<UploadFileResponseDto[]>
  async deleteFile(filename: string): Promise<void>
  
  // File validation
  private validateFile(file: Express.Multer.File): void
  private generateUniqueFilename(originalName: string): string
  
  // AWS S3 operations
  private uploadToS3(file: Express.Multer.File, s3Key: string): Promise<void>
  private deleteFromS3(s3Key: string): Promise<void>
}
```

**Usage Example**:
```typescript
// Upload single file to S3
const result = await this.uploadService.uploadFile(file);
// Returns: { filename: "uuid-generated.jpg", url: "https://bucket.s3.region.amazonaws.com/uploads/uuid-generated.jpg", size: 1024000, mimetype: "image/jpeg" }

// Upload multiple files to S3
const results = await this.uploadService.uploadMultipleFiles(files);

// Delete file from S3
await this.uploadService.deleteFile('uuid-generated.jpg');
```

**AWS S3 Integration Features**:
- **Automatic S3 Upload**: All files uploaded directly to AWS S3
- **Unique Filenames**: UUID-based naming prevents conflicts
- **File Validation**: Size limits (10MB) and MIME type validation
- **S3 URL Generation**: Direct S3 URLs for file access
- **Error Handling**: Comprehensive error handling for S3 operations

### 13. Payments Service (`PaymentsService`)

**Purpose**: Payment processing, gateway integration, and transaction management

**Key Methods**:

```typescript
@Injectable()
export class PaymentsService {
  constructor(
    private stripeService: StripeService,
    private razorpayService: RazorpayService,
    private prisma: PrismaService,
  ) {}

  // Payment creation
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment>
  async createStripePayment(paymentData: StripePaymentData): Promise<StripePaymentResult>
  async createRazorpayPayment(paymentData: RazorpayPaymentData): Promise<RazorpayPaymentResult>
  
  // Payment processing
  async processPayment(paymentId: string): Promise<PaymentResult>
  async confirmPayment(paymentId: string, paymentMethod: string): Promise<PaymentResult>
  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult>
  
  // Payment status management
  async updatePaymentStatus(paymentId: string, status: PaymentStatus, transactionId?: string): Promise<Payment>
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus>
  
  // Payment history
  async getPaymentHistory(userId: string): Promise<Payment[]>
  async getPaymentById(paymentId: string): Promise<Payment>
  
  // Webhook handling
  async handleStripeWebhook(payload: any, signature: string): Promise<void>
  async handleRazorpayWebhook(payload: any): Promise<void>
}
```

**Usage Example**:
```typescript
// Create payment
const payment = await this.paymentsService.createPayment({
  amount: 15000.00,
  currency: 'INR',
  paymentMethod: 'STRIPE',
  orderId: 'order-123',
  description: 'Payment for requirement offer'
});

// Process payment
const result = await this.paymentsService.processPayment(paymentId);

// Handle webhook
await this.paymentsService.handleStripeWebhook(payload, signature);
```

## Admin Services

### 1. Admin Users Service (`AdminUsersService`)

**Purpose**: Admin-specific user management operations

**Key Methods**:

```typescript
@Injectable()
export class AdminUsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // Admin user operations
  async getAllUsers(filters?: AdminUserFilters): Promise<PaginatedUserResponse>
  async getUserDetails(userId: string): Promise<AdminUserDetails>
  async updateUserStatus(userId: string, isActive: boolean, reason: string): Promise<User>
  async enableUser(userId: string, reason: string): Promise<User>
  async disableUser(userId: string, reason: string): Promise<User>
  
  // User statistics
  async getUserStats(): Promise<AdminUserStats>
  async getUserActivity(userId: string): Promise<UserActivity[]>
  
  // Bulk operations
  async bulkUpdateUsers(updates: BulkUserUpdate[]): Promise<void>
  async exportUsers(filters?: AdminUserFilters): Promise<Buffer>
}
```

### 2. Admin Dashboard Service (`AdminDashboardService`)

**Purpose**: Dashboard analytics, KPIs, and reporting

**Key Methods**:

```typescript
@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<DashboardKPIs>
  async getUserStatistics(): Promise<UserStatistics>
  async getRevenueAnalytics(period: string): Promise<RevenueAnalytics>
  async getPlatformMetrics(): Promise<PlatformMetrics>
  
  // Recent activity
  async getRecentActivity(limit: number): Promise<RecentActivity[]>
  async getRecentKycSubmissions(limit: number): Promise<KycSubmission[]>
  async getRecentAuctions(limit: number): Promise<Auction[]>
  
  // Reports
  async generateUserReport(period: string): Promise<UserReport>
  async generateRevenueReport(period: string): Promise<RevenueReport>
  async generateActivityReport(period: string): Promise<ActivityReport>
}
```

### 3. Audit Service (`AuditService`)

**Purpose**: Activity logging, audit trails, and compliance tracking

**Key Methods**:

```typescript
@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  // Audit logging
  async logAction(action: AuditAction): Promise<AuditLog>
  async logUserAction(userId: string, action: string, details: any): Promise<AuditLog>
  async logAdminAction(adminId: string, action: string, details: any): Promise<AuditLog>
  
  // Audit queries
  async getAuditLogs(filters?: AuditFilters): Promise<AuditLog[]>
  async getUserAuditLogs(userId: string): Promise<AuditLog[]>
  async getAdminAuditLogs(adminId: string): Promise<AuditLog[]>
  
  // Compliance
  async generateComplianceReport(period: string): Promise<ComplianceReport>
  async getDataRetentionLogs(): Promise<DataRetentionLog[]>
}
```

## Service Integration Patterns

### 1. Service Composition

```typescript
@Injectable()
export class OrderService {
  constructor(
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
    private logisticsService: LogisticsService,
  ) {}

  async processOrder(orderData: OrderData): Promise<Order> {
    // Process payment
    const payment = await this.paymentsService.createPayment(orderData.payment);
    
    // Create logistics
    const logistics = await this.logisticsService.createLogistics(orderData.logistics);
    
    // Send notifications
    await this.notificationsService.createOrderNotification(orderData.userId, orderData);
    
    return { payment, logistics };
  }
}
```

### 2. Event-Driven Services

```typescript
@Injectable()
export class AuctionEventHandler {
  constructor(
    private notificationsService: NotificationsService,
    private paymentsService: PaymentsService,
  ) {}

  @OnEvent('auction.ended')
  async handleAuctionEnded(payload: AuctionEndedEvent) {
    // Send winner notification
    await this.notificationsService.createAuctionNotification(
      payload.winnerId,
      'AUCTION_WON',
      payload
    );
    
    // Process payment
    await this.paymentsService.createPayment({
      amount: payload.finalBid,
      userId: payload.winnerId,
      description: `Payment for auction ${payload.auctionId}`
    });
  }
}
```

### 3. Caching Integration

```typescript
@Injectable()
export class CachedUsersService {
  constructor(
    private usersService: UsersService,
    private cacheService: CacheService,
  ) {}

  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    
    // Try cache first
    let user = await this.cacheService.get<User>(cacheKey);
    
    if (!user) {
      // Cache miss - fetch from service
      user = await this.usersService.findOne(id);
      
      if (user) {
        // Store in cache
        await this.cacheService.set(cacheKey, user, 300); // 5 minutes
      }
    }
    
    return user;
  }
}
```

## Error Handling in Services

### 1. Service-Level Error Handling

```typescript
@Injectable()
export class BaseService {
  protected async handleServiceError(error: Error, context: string): Promise<never> {
    console.error(`Service error in ${context}:`, error);
    
    if (error instanceof PrismaClientKnownRequestError) {
      throw new DatabaseException(error.message);
    }
    
    if (error instanceof ValidationError) {
      throw new ValidationException(error.message);
    }
    
    throw new ServiceException(`Error in ${context}: ${error.message}`);
  }
}
```

### 2. Custom Service Exceptions

```typescript
export class ServiceException extends HttpException {
  constructor(message: string, statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, statusCode);
  }
}

export class ValidationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class DatabaseException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
```

## Testing Services

### 1. Service Unit Testing

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto = { email: 'test@example.com', password: 'password123' };
      const expectedUser = { id: '1', email: 'test@example.com' };

      jest.spyOn(prisma.user, 'create').mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual(expectedUser);
    });

    it('should handle database errors', async () => {
      const createUserDto = { email: 'test@example.com', password: 'password123' };

      jest.spyOn(prisma.user, 'create').mockRejectedValue(new Error('Database error'));

      await expect(service.create(createUserDto)).rejects.toThrow(ServiceException);
    });
  });
});
```

### 2. Service Integration Testing

```typescript
describe('AuthService Integration', () => {
  let app: INestApplication;
  let authService: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  it('should login user and return tokens', async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 12),
        companyName: 'Test Company',
      },
    });

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('refresh_token');
    expect(result.user.id).toBe(user.id);
  });
});
```

## Performance Optimization

### 1. Database Query Optimization

```typescript
@Injectable()
export class OptimizedUsersService {
  constructor(private prisma: PrismaService) {}

  async findUsersWithRelations(userIds: string[]): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        addresses: true,
        kyc: true,
        listings: {
          select: { id: true, title: true, status: true },
        },
      },
    });
  }

  async findUsersWithPagination(page: number, limit: number) {
    return this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        companyName: true,
        role: true,
        kycStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

### 2. Caching Strategy

```typescript
@Injectable()
export class CachedProductsService {
  constructor(
    private productsService: ProductsService,
    private cacheService: CacheService,
  ) {}

  async getFeaturedProducts(): Promise<Product[]> {
    const cacheKey = 'featured_products';
    
    let products = await this.cacheService.get<Product[]>(cacheKey);
    
    if (!products) {
      products = await this.productsService.getFeaturedProducts();
      await this.cacheService.set(cacheKey, products, 3600); // 1 hour
    }
    
    return products;
  }

  async invalidateProductCache(productId: string): Promise<void> {
    await this.cacheService.invalidate(`product:${productId}`);
    await this.cacheService.invalidate('featured_products');
  }
}
```

## Recent Updates

### Offer Acceptance Flow with Quantity Management
- **New Feature**: Complete offer acceptance flow with automatic quantity reduction
- **Backend Validation**: Prevents accepting offers when insufficient available quantity
- **Quantity Reduction**: `availableQuantity` automatically reduced when offer is accepted
- **Error Handling**: Clear error messages when quantity validation fails
- **Data Consistency**: Ensures listing data remains accurate after offer acceptance

### Offer Management Enhancements
- **New Endpoint**: `PUT /offers/{id}` for updating offer details (quantity and message)
- **New Endpoints**: `PUT /offers/{id}/accept` and `PUT /offers/{id}/reject` for offer actions
- **Validation**: Quantity validation ensures offered quantity doesn't exceed available quantity
- **Authorization**: Only offer creators can update their own pending offers
- **Status Restriction**: Only PENDING offers can be updated

### Implementation Details

**1. Offer Acceptance with Quantity Reduction**
```typescript
// src/offers/offers.service.ts
if (updateDto.action === OfferAction.ACCEPTED) {
  const currentAvailableQuantity = parseFloat(offer.requirement.availableQuantity || '0');
  const offeredQuantity = parseFloat(offer.offeredQuantity);
  
  // Validate that there's enough available quantity
  if (offeredQuantity > currentAvailableQuantity) {
    throw new BadRequestException(
      `Cannot accept offer. Offered quantity (${offeredQuantity}) exceeds available quantity (${currentAvailableQuantity})`
    );
  }
  
  const newAvailableQuantity = Math.max(0, currentAvailableQuantity - offeredQuantity);
  
  // Update requirement's available quantity
  await this.prisma.requirement.update({
    where: { id: offer.requirementId },
    data: { availableQuantity: newAvailableQuantity.toString() },
  });
}
```

**2. Offer Creation Validation**
```typescript
// Validate offered quantity against available quantity
const offeredQuantity = parseFloat(createOfferDto.offeredQuantity);
const availableQuantity = parseFloat(requirement.availableQuantity || '0');

if (offeredQuantity > availableQuantity) {
  throw new BadRequestException(
    `Cannot create offer. Offered quantity (${offeredQuantity}) exceeds available quantity (${availableQuantity})`
  );
}
```

**3. New Controller Endpoints**
```typescript
// src/offers/offers.controller.ts
@Put(':id')
async updateOfferDetails(
  @Param('id') id: string,
  @Request() req,
  @Body() updateDto: UpdateOfferDetailsDto,
) {
  return this.offersService.updateOfferDetails(id, req.user.sub, updateDto);
}

@Put(':id/accept')
async acceptOffer(
  @Param('id') id: string,
  @Request() req,
  @Body() body?: { notes?: string },
) {
  return this.offersService.updateOfferStatus(id, req.user.sub, {
    action: 'ACCEPTED' as any,
    notes: body?.notes,
  });
}
```

---

*This services and business logic documentation provides comprehensive information about all services, their responsibilities, implementation patterns, and usage examples for the NexGPetrolube Backend API.*
