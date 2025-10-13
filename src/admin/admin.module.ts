import { Module } from '@nestjs/common';
import { AdminCommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { KycModule } from './kyc/kyc.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditModule } from './audit/audit.module';
import { AdminCategoriesModule } from './categories/categories.module';
import { AdminBrandsModule } from './brands/brands.module';
import { AdminProductsModule } from './products/products.module';
import { AdminCountsModule } from './counts/counts.module';
import { AdminRequirementsModule } from './requirements/requirements.module';
import { AdminRequirementOffersModule } from './requirement-offers/requirement-offers.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    AdminCommonModule,
    UsersModule,
    KycModule,
    DashboardModule,
    AuditModule,
    AdminCategoriesModule,
    AdminBrandsModule,
    AdminProductsModule,
    AdminCountsModule,
    AdminRequirementsModule,
    AdminRequirementOffersModule,
    UploadsModule,
  ],
})
export class AdminModule {}
