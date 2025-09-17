import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AdminCommonModule } from '../common/common.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [AdminCommonModule, DatabaseModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
