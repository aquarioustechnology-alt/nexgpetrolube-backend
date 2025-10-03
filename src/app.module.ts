import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KycModule } from './kyc/kyc.module';
import { ProductsModule } from './products/products.module';
import { RequirementsModule } from './requirements/requirements.module';
import { AuctionsModule } from './auctions/auctions.module';
import { BidsModule } from './bids/bids.module';
import { QuotesModule } from './quotes/quotes.module';
import { CategoriesModule } from './categories/categories.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { WebsocketModule } from './websocket/websocket.module';
import { OffersModule } from './offers/offers.module';
import { PaymentsModule } from './payments/payments.module';
import { LogisticsModule } from './logistics/logistics.module';
import { CommonModule } from './common/common.module';
import { AppConfigModule } from './config/app.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // App configuration
    AppConfigModule,

    // Database
    DatabaseModule,

    // Core modules
    AuthModule,
    UsersModule,
    KycModule,
    ProductsModule,
    RequirementsModule,
    AuctionsModule,
    BidsModule,
    QuotesModule,
    CategoriesModule,
    NotificationsModule,
    OffersModule,
    PaymentsModule,
    LogisticsModule,
    AdminModule,
    UploadModule,
    WebsocketModule,
    CommonModule,
  ],
})
export class AppModule {}
