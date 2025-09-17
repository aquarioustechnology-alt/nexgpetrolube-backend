import { Module } from '@nestjs/common';
import { AdminCategoriesController } from './categories.controller';
import { AdminCategoriesTestController } from './categories-test.controller';
import { AdminCategoriesService } from './categories.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminCategoriesController, AdminCategoriesTestController],
  providers: [AdminCategoriesService],
  exports: [AdminCategoriesService],
})
export class AdminCategoriesModule {}
