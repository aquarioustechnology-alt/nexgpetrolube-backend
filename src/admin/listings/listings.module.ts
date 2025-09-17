import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { AdminCommonModule } from '../common/common.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [AdminCommonModule, DatabaseModule],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
