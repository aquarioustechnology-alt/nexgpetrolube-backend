import { Module } from '@nestjs/common';
import { AdminProductsController } from './products.controller';
import { AdminProductsService } from './products.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminProductsController],
  providers: [AdminProductsService],
  exports: [AdminProductsService],
})
export class AdminProductsModule {}
