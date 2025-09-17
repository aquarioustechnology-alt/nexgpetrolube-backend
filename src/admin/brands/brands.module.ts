import { Module } from '@nestjs/common';
// Brands module for admin panel
import { AdminBrandsController } from './brands.controller';
import { AdminBrandsService } from './brands.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminBrandsController],
  providers: [AdminBrandsService],
  exports: [AdminBrandsService],
})
export class AdminBrandsModule {}
