# Deployment Documentation

## Overview

This documentation covers deployment strategies, configuration, and best practices for the NexGPetrolube Backend API. It includes development, staging, and production deployment scenarios with Docker, cloud platforms, and CI/CD pipelines.

## Deployment Architecture

### Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx/ALB)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                Application Servers (2+)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Node.js   │  │   Node.js   │  │   Node.js   │         │
│  │   NestJS    │  │   NestJS    │  │   NestJS    │         │
│  │   Port 8000 │  │   Port 8000 │  │   Port 8000 │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                    Database Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ PostgreSQL  │  │    Redis    │  │   AWS S3    │         │
│  │  Primary    │  │   Cache     │  │   Storage   │         │
│  │  Database   │  │   Session   │  │   Files     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Environment Configuration

### Environment Variables

#### Development Environment
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nexg_petrolube_dev?schema=public"

# JWT Configuration
JWT_SECRET="dev-jwt-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="dev-refresh-secret"
JWT_REFRESH_EXPIRES_IN="30d"

# Application
NODE_ENV="development"
PORT=8000
API_PREFIX="api/v1"
FRONTEND_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"

# File Upload - AWS S3
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="nexg-project-uploads-dev"
AWS_S3_ENDPOINT="https://s3.ap-south-1.amazonaws.com"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="dev@nexgpetrolube.com"
SMTP_PASS="dev-app-password"
SMTP_FROM_NAME="NexGPetrolube Dev"
SMTP_FROM_EMAIL="noreply@dev.nexgpetrolube.com"

# Payment Gateways - Test Mode
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="dev-razorpay-secret"

# Admin Configuration
ADMIN_DEMO_EMAIL="admin@nexgpetrolube.com"
ADMIN_DEMO_PASSWORD="Admin@123"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=1000

# CORS Configuration
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# WebSocket Configuration
WS_CORS_ORIGIN="http://localhost:3000,http://localhost:3001"

# File Upload Limits
MAX_FILE_SIZE=10485760
MAX_FILES=5

# Security
BCRYPT_ROUNDS=10
SESSION_SECRET="dev-session-secret"
```

#### Staging Environment
```env
# Database
DATABASE_URL="postgresql://username:password@staging-db:5432/nexg_petrolube_staging?schema=public"

# JWT Configuration
JWT_SECRET="staging-jwt-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="staging-refresh-secret"
JWT_REFRESH_EXPIRES_IN="30d"

# Application
NODE_ENV="staging"
PORT=8000
API_PREFIX="api/v1"
FRONTEND_URL="https://staging.nexgpetrolube.com"
ADMIN_URL="https://admin-staging.nexgpetrolube.com"

# File Upload - AWS S3
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="nexg-project-uploads-staging"
AWS_S3_ENDPOINT="https://s3.ap-south-1.amazonaws.com"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="staging@nexgpetrolube.com"
SMTP_PASS="staging-app-password"
SMTP_FROM_NAME="NexGPetrolube Staging"
SMTP_FROM_EMAIL="noreply@staging.nexgpetrolube.com"

# Payment Gateways - Test Mode
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="staging-razorpay-secret"

# Admin Configuration
ADMIN_DEMO_EMAIL="admin@nexgpetrolube.com"
ADMIN_DEMO_PASSWORD="Admin@123"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=500

# CORS Configuration
CORS_ORIGIN="https://staging.nexgpetrolube.com,https://admin-staging.nexgpetrolube.com"

# Redis
REDIS_HOST="staging-redis.nexgpetrolube.com"
REDIS_PORT=6379
REDIS_PASSWORD="staging-redis-password"

# WebSocket Configuration
WS_CORS_ORIGIN="https://staging.nexgpetrolube.com,https://admin-staging.nexgpetrolube.com"

# File Upload Limits
MAX_FILE_SIZE=10485760
MAX_FILES=5

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="staging-session-secret"

# Monitoring
SENTRY_DSN="https://staging-sentry-dsn@sentry.io/project"
```

#### Production Environment
```env
# Database
DATABASE_URL="postgresql://username:password@prod-db-cluster:5432/nexg_petrolube_prod?schema=public"

# JWT Configuration
JWT_SECRET="production-jwt-secret-key-very-long-and-secure"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="production-refresh-secret-very-long-and-secure"
JWT_REFRESH_EXPIRES_IN="30d"

# Application
NODE_ENV="production"
PORT=8000
API_PREFIX="api/v1"
FRONTEND_URL="https://nexgpetrolube.com"
ADMIN_URL="https://admin.nexgpetrolube.com"

# File Upload - AWS S3
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="nexg-petrolube-prod"
AWS_S3_ENDPOINT="https://s3.ap-south-1.amazonaws.com"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="noreply@nexgpetrolube.com"
SMTP_PASS="production-app-password"
SMTP_FROM_NAME="NexGPetrolube"
SMTP_FROM_EMAIL="noreply@nexgpetrolube.com"

# Payment Gateways - Live Mode
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="production-razorpay-secret"

# Admin Configuration
ADMIN_DEMO_EMAIL="admin@nexgpetrolube.com"
ADMIN_DEMO_PASSWORD="Admin@123"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS Configuration
CORS_ORIGIN="https://nexgpetrolube.com,https://admin.nexgpetrolube.com"

# Redis
REDIS_HOST="prod-redis.nexgpetrolube.com"
REDIS_PORT=6379
REDIS_PASSWORD="production-redis-password"

# WebSocket Configuration
WS_CORS_ORIGIN="https://nexgpetrolube.com,https://admin.nexgpetrolube.com"

# File Upload Limits
MAX_FILE_SIZE=10485760
MAX_FILES=5

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="production-session-secret-very-long-and-secure"

# Monitoring
SENTRY_DSN="https://production-sentry-dsn@sentry.io/project"

# External APIs
GOOGLE_MAPS_API_KEY="production-google-maps-api-key"
SENDGRID_API_KEY="production-sendgrid-api-key"
```

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm prisma:generate

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install production dependencies only
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Create uploads directory
RUN mkdir -p uploads && chown nestjs:nodejs uploads

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Docker Compose

#### Development
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/nexg_petrolube_dev
      - REDIS_HOST=redis
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
      - redis
    command: pnpm start:dev

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=nexg_petrolube_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

#### Production
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

volumes:
  postgres_data:
  redis_data:
```

### Nginx Configuration

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server app:8000;
    }

    server {
        listen 80;
        server_name api.nexgpetrolube.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.nexgpetrolube.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Rate limiting
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
        limit_req zone=api burst=20 nodelay;

        # API routes
        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # File uploads
        location /uploads/ {
            proxy_pass http://backend;
            client_max_body_size 10M;
        }

        # Health check
        location /health {
            proxy_pass http://backend;
            access_log off;
        }
    }
}
```

## Cloud Deployment

### AWS Deployment

#### ECS Task Definition
```json
{
  "family": "nexg-petrolube-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "nexg-petrolube-backend",
      "image": "account.dkr.ecr.region.amazonaws.com/nexg-petrolube-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "8000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:nexg-petrolube/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:nexg-petrolube/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/nexg-petrolube-backend",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### ECS Service Configuration
```json
{
  "serviceName": "nexg-petrolube-backend-service",
  "cluster": "nexg-petrolube-cluster",
  "taskDefinition": "nexg-petrolube-backend",
  "desiredCount": 3,
  "launchType": "FARGATE",
  "platformVersion": "LATEST",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["subnet-12345", "subnet-67890"],
      "securityGroups": ["sg-12345"],
      "assignPublicIp": "ENABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:region:account:targetgroup/nexg-petrolube-backend/12345",
      "containerName": "nexg-petrolube-backend",
      "containerPort": 8000
    }
  ],
  "serviceRegistries": [
    {
      "registryArn": "arn:aws:servicediscovery:region:account:service/srv-12345"
    }
  ]
}
```

### Google Cloud Platform Deployment

#### Cloud Run Configuration
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: nexg-petrolube-backend
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/ingress-status: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        autoscaling.knative.dev/minScale: "1"
        run.googleapis.com/cpu-throttling: "true"
        run.googleapis.com/execution-environment: gen2
    spec:
      containerConcurrency: 100
      timeoutSeconds: 300
      containers:
      - image: gcr.io/project-id/nexg-petrolube-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "8000"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: nexg-petrolube-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: nexg-petrolube-secrets
              key: jwt-secret
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
          requests:
            cpu: "0.5"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Generate Prisma client
      run: npx prisma generate

    - name: Run database migrations
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

    - name: Run tests
      run: npm run test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        JWT_SECRET: test-secret

    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        JWT_SECRET: test-secret

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'

    steps:
    - uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
    - uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ap-south-1

    - name: Update ECS service
      run: |
        aws ecs update-service \
          --cluster nexg-petrolube-staging \
          --service nexg-petrolube-backend-staging \
          --force-new-deployment

    - name: Wait for deployment
      run: |
        aws ecs wait services-stable \
          --cluster nexg-petrolube-staging \
          --services nexg-petrolube-backend-staging

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
    - uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ap-south-1

    - name: Update ECS service
      run: |
        aws ecs update-service \
          --cluster nexg-petrolube-production \
          --service nexg-petrolube-backend-production \
          --force-new-deployment

    - name: Wait for deployment
      run: |
        aws ecs wait services-stable \
          --cluster nexg-petrolube-production \
          --services nexg-petrolube-backend-production

    - name: Run database migrations
      run: |
        aws ecs run-task \
          --cluster nexg-petrolube-production \
          --task-definition nexg-petrolube-migrate \
          --launch-type FARGATE \
          --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### GitLab CI/CD Pipeline

```yaml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

services:
  - docker:20.10.16-dind

test:
  stage: test
  image: node:18-alpine
  services:
    - postgres:15
    - redis:7
  variables:
    POSTGRES_DB: test_db
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    DATABASE_URL: postgresql://postgres:postgres@postgres:5432/test_db
  before_script:
    - npm ci
    - npx prisma generate
    - npx prisma migrate deploy
  script:
    - npm run test
    - npm run test:e2e
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker build -t $CI_REGISTRY_IMAGE:latest .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main
    - develop

deploy-staging:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST $STAGING_WEBHOOK_URL
  environment:
    name: staging
    url: https://staging.nexgpetrolube.com
  only:
    - develop

deploy-production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - curl -X POST $PRODUCTION_WEBHOOK_URL
  environment:
    name: production
    url: https://nexgpetrolube.com
  only:
    - main
  when: manual
```

## Database Migration Strategy

### Migration Commands

```bash
# Development
pnpm prisma:migrate dev --name add_new_feature

# Staging
pnpm prisma:migrate deploy

# Production
pnpm prisma:migrate deploy --schema=./prisma/schema.prisma
```

### Migration Script

```typescript
// scripts/migrate.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Run migrations
    await prisma.$executeRaw`SELECT 1`;
    
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
```

### Rollback Strategy

```bash
# Rollback to previous migration
pnpm prisma:migrate reset

# Rollback specific migration
pnpm prisma:migrate resolve --rolled-back 20240101000000_migration_name
```

## Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint
```typescript
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async checkHealth() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  @Get('ready')
  async checkReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch (error) {
      throw new HttpException('Not ready', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  @Get('live')
  async checkLiveness() {
    return { status: 'alive' };
  }
}
```

#### Logging Configuration
```typescript
// src/config/logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});
```

### Performance Monitoring

#### Metrics Collection
```typescript
@Injectable()
export class MetricsService {
  private requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  private responseTime = new Histogram({
    name: 'http_response_time_seconds',
    help: 'HTTP response time in seconds',
    labelNames: ['method', 'route'],
  });

  recordRequest(method: string, route: string, statusCode: number, duration: number) {
    this.requestCounter.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });

    this.responseTime.observe(
      { method, route },
      duration / 1000,
    );
  }
}
```

## Security Considerations

### SSL/TLS Configuration

```typescript
// SSL configuration in main.ts
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: process.env.NODE_ENV === 'production' ? {
      key: fs.readFileSync('/etc/ssl/private/nexgpetrolube.key'),
      cert: fs.readFileSync('/etc/ssl/certs/nexgpetrolube.crt'),
    } : undefined,
  });
  
  // ... rest of configuration
}
```

### Security Headers

```typescript
// Security middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

## Backup and Recovery

### Database Backup Strategy

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="nexg_petrolube_prod"

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://nexg-petrolube-backups/

# Keep only last 7 days locally
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### Automated Backup with Cron

```bash
# Add to crontab
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

## Troubleshooting

### Common Deployment Issues

#### Database Connection Issues
```bash
# Check database connectivity
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"

# Check connection pool
netstat -an | grep :5432
```

#### Memory Issues
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Check Node.js memory
node --max-old-space-size=4096 dist/main.js
```

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :8000
lsof -i :8000
```

### Log Analysis

```bash
# View application logs
docker logs -f container_name

# View specific log levels
docker logs container_name 2>&1 | grep ERROR

# View logs with timestamps
docker logs -t container_name
```

---

*This deployment documentation provides comprehensive information about deploying the NexGPetrolube Backend API across different environments, platforms, and scenarios.*
