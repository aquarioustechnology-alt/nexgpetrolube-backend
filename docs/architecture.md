# Backend Architecture Documentation

## Overview

The NexGPetrolube Backend API follows a modular, scalable architecture built on NestJS framework. The architecture emphasizes separation of concerns, dependency injection, and maintainable code structure.

## Architecture Principles

### 1. Modular Architecture
- **Module-based Design**: Each feature is organized into self-contained modules
- **Dependency Injection**: Services and dependencies are injected through NestJS DI container
- **Separation of Concerns**: Clear separation between controllers, services, and data access layers

### 2. Layered Architecture
```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│         (Controllers & DTOs)         │
├─────────────────────────────────────┤
│           Business Logic Layer      │
│            (Services)               │
├─────────────────────────────────────┤
│           Data Access Layer         │
│         (Prisma ORM)                │
├─────────────────────────────────────┤
│           Database Layer            │
│         (PostgreSQL)                │
└─────────────────────────────────────┘
```

### 3. Domain-Driven Design
- **Bounded Contexts**: Each module represents a business domain
- **Aggregates**: Core business entities with their lifecycle
- **Value Objects**: Immutable objects representing concepts
- **Domain Services**: Business logic that doesn't belong to entities

## Core Architecture Components

### 1. Application Module (`app.module.ts`)

**Purpose**: Root module that orchestrates all application modules

**Key Responsibilities**:
- Module registration and configuration
- Global middleware setup
- Environment configuration
- Cross-cutting concerns

```typescript
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Core modules
    DatabaseModule,
    AuthModule,
    UsersModule,
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. Database Module (`database/`)

**Purpose**: Database configuration and Prisma service

**Components**:
- **PrismaService**: Database connection and query interface
- **DatabaseModule**: Module configuration

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### 3. Authentication Module (`auth/`)

**Purpose**: Authentication and authorization system

**Architecture Components**:

#### Controllers
- **AuthController**: Authentication endpoints
- **AdminAuthController**: Admin-specific authentication

#### Services
- **AuthService**: Core authentication logic
- **OtpService**: OTP generation and verification

#### Guards
- **JwtAuthGuard**: JWT token validation
- **RolesGuard**: Role-based access control

#### Strategies
- **JwtStrategy**: JWT token strategy
- **LocalStrategy**: Local authentication strategy

#### Decorators
- **@CurrentUser()**: Extract current user from request
- **@Roles()**: Role-based access control
- **@Public()**: Mark endpoints as public

### 4. User Management Module (`users/`)

**Purpose**: User lifecycle management

**Architecture**:
```
UsersController
    ↓
UsersService
    ↓
PrismaService
    ↓
PostgreSQL
```

**Key Features**:
- User CRUD operations
- Profile management
- KYC submission
- Role management

### 5. Admin Module (`admin/`)

**Purpose**: Administrative functionality

**Sub-modules**:
- **UsersModule**: Admin user management
- **KycModule**: KYC review and approval
- **ListingsModule**: Content moderation
- **RequirementsModule**: Requirements management
- **DashboardModule**: Analytics and KPIs
- **AuditModule**: Activity logging

**Architecture Pattern**:
```
AdminController
    ↓
AdminService
    ↓
PrismaService
    ↓
AuditInterceptor (for logging)
    ↓
PostgreSQL
```

### 6. Business Logic Modules

#### Products Module (`products/`)
- Product catalog management
- Category and brand management
- Product specifications

#### Requirements Module (`requirements/`)
- Buyer requirements
- Quote system
- Requirement lifecycle

#### Auctions Module (`auctions/`)
- Auction creation and management
- Real-time bidding
- Auction scheduling

#### Offers Module (`offers/`)
- Listing offers
- Requirement offers
- Offer negotiation

## Data Flow Architecture

### 1. Request Flow
```
Client Request
    ↓
Middleware (CORS, Helmet, Compression)
    ↓
Guards (JWT, Roles)
    ↓
Controller
    ↓
Service
    ↓
Prisma Service
    ↓
PostgreSQL Database
    ↓
Response
```

### 2. Authentication Flow
```
Login Request
    ↓
AuthController
    ↓
AuthService.validateUser()
    ↓
AuthService.login()
    ↓
JWT Token Generation
    ↓
Response with Token
```

### 3. Authorization Flow
```
Protected Request
    ↓
JwtAuthGuard
    ↓
JwtStrategy.validate()
    ↓
RolesGuard
    ↓
Roles Decorator Check
    ↓
Controller Method
```

## Service Architecture Patterns

### 1. Service Layer Pattern

**Purpose**: Encapsulate business logic and data access

```typescript
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Business logic
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    
    // Data access
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }
}
```

### 2. Repository Pattern (via Prisma)

**Purpose**: Abstract data access layer

```typescript
// Prisma provides repository-like interface
const user = await this.prisma.user.findUnique({
  where: { id: userId },
  include: {
    addresses: true,
    kyc: true,
  },
});
```

### 3. Factory Pattern

**Purpose**: Create complex objects

```typescript
@Injectable()
export class NotificationFactory {
  createEmailNotification(data: NotificationData): EmailNotification {
    return new EmailNotification(data);
  }

  createSmsNotification(data: NotificationData): SmsNotification {
    return new SmsNotification(data);
  }
}
```

## Error Handling Architecture

### 1. Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
```

### 2. Custom Exceptions

```typescript
export class UserNotFoundException extends HttpException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InsufficientPermissionsException extends HttpException {
  constructor() {
    super('Insufficient permissions', HttpStatus.FORBIDDEN);
  }
}
```

## Security Architecture

### 1. Authentication Security

```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return this.authService.validateUser(payload.sub);
  }
}
```

### 2. Authorization Security

```typescript
// Roles Guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### 3. Input Validation

```typescript
// DTO with validation
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;

  @IsString()
  @MinLength(2)
  firstName: string;
}
```

## Real-time Architecture

### 1. WebSocket Gateway

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN?.split(',') || '*',
  },
})
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_auction')
  handleJoinAuction(client: Socket, data: { auctionId: string }) {
    client.join(`auction_${data.auctionId}`);
  }

  @SubscribeMessage('place_bid')
  async handlePlaceBid(client: Socket, data: PlaceBidDto) {
    const bid = await this.bidsService.createBid(data);
    this.server.to(`auction_${data.auctionId}`).emit('new_bid', bid);
  }
}
```

### 2. Event-Driven Architecture

```typescript
// Event emission
@Injectable()
export class AuctionService {
  constructor(private eventEmitter: EventEmitter2) {}

  async endAuction(auctionId: string) {
    const auction = await this.updateAuctionStatus(auctionId, 'ENDED');
    
    // Emit event
    this.eventEmitter.emit('auction.ended', {
      auctionId,
      winner: auction.winner,
      finalBid: auction.finalBid,
    });
  }
}

// Event listener
@OnEvent('auction.ended')
handleAuctionEnded(payload: AuctionEndedEvent) {
  // Send notifications
  // Update user accounts
  // Generate reports
}
```

## File Upload Architecture

### 1. Upload Service

```typescript
@Injectable()
export class UploadService {
  constructor(
    private s3Service: S3Service,
    private configService: ConfigService,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    const key = this.generateFileKey(file.originalname);
    
    // Upload to S3
    const s3Result = await this.s3Service.upload({
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    return {
      filename: file.originalname,
      url: s3Result.Location,
      key: key,
    };
  }
}
```

### 2. File Storage Strategy

```typescript
// Multi-provider file storage
@Injectable()
export class FileStorageService {
  constructor(
    private s3Service: S3Service,
    private localStorageService: LocalStorageService,
  ) {}

  async storeFile(file: Express.Multer.File): Promise<string> {
    try {
      // Try S3 first
      return await this.s3Service.uploadFile(file);
    } catch (error) {
      // Fallback to local storage
      return await this.localStorageService.uploadFile(file);
    }
  }
}
```

## Caching Architecture

### 1. Redis Integration

```typescript
@Injectable()
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 2. Cache-Aside Pattern

```typescript
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async findOne(id: string): Promise<User> {
    const cacheKey = `user:${id}`;
    
    // Try cache first
    let user = await this.cache.get<User>(cacheKey);
    
    if (!user) {
      // Cache miss - fetch from database
      user = await this.prisma.user.findUnique({ where: { id } });
      
      if (user) {
        // Store in cache
        await this.cache.set(cacheKey, user, 300); // 5 minutes
      }
    }
    
    return user;
  }
}
```

## Monitoring Architecture

### 1. Logging Strategy

```typescript
@Injectable()
export class LoggerService {
  private logger = new Logger('Application');

  logRequest(req: Request, res: Response, next: NextFunction) {
    const { method, url, ip } = req;
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log(`${method} ${url} ${res.statusCode} ${duration}ms - ${ip}`);
    });

    next();
  }
}
```

### 2. Metrics Collection

```typescript
@Injectable()
export class MetricsService {
  private requestCounter = new Counter('http_requests_total');
  private responseTime = new Histogram('http_response_time_seconds');

  recordRequest(method: string, path: string, statusCode: number, duration: number) {
    this.requestCounter.inc({
      method,
      path,
      status_code: statusCode.toString(),
    });

    this.responseTime.observe(duration / 1000);
  }
}
```

## Testing Architecture

### 1. Unit Testing

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

  it('should create a user', async () => {
    const createUserDto = { email: 'test@example.com', password: 'password123' };
    const expectedUser = { id: '1', email: 'test@example.com' };

    jest.spyOn(prisma.user, 'create').mockResolvedValue(expectedUser);

    const result = await service.create(createUserDto);
    expect(result).toEqual(expectedUser);
  });
});
```

### 2. Integration Testing

```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('meta');
      });
  });
});
```

## Deployment Architecture

### 1. Container Architecture

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "run", "start:prod"]
```

### 2. Environment Configuration

```typescript
// Configuration service
@Injectable()
export class ConfigService {
  get databaseUrl(): string {
    return this.get('DATABASE_URL');
  }

  get jwtSecret(): string {
    return this.get('JWT_SECRET');
  }

  get isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }
}
```

## Performance Architecture

### 1. Database Optimization

```typescript
// Query optimization
async findUsersWithPagination(page: number, limit: number) {
  return this.prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      // Only select needed fields
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
```

### 2. Connection Pooling

```typescript
// Prisma connection configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});
```

## Scalability Considerations

### 1. Horizontal Scaling
- Stateless application design
- Database connection pooling
- Load balancer compatibility
- Session management via Redis

### 2. Vertical Scaling
- Memory optimization
- CPU-intensive task optimization
- Database query optimization
- Caching strategies

### 3. Microservices Readiness
- Modular architecture
- Clear service boundaries
- Event-driven communication
- Independent deployment capability

---

*This architecture documentation provides a comprehensive overview of the NexGPetrolube Backend API architecture, design patterns, and implementation strategies.*
