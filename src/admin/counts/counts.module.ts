import { Module } from '@nestjs/common';
import { AdminCountsController } from './counts.controller';
import { AdminCountsService } from './counts.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminCountsController],
  providers: [AdminCountsService],
  exports: [AdminCountsService],
})
export class AdminCountsModule {}
