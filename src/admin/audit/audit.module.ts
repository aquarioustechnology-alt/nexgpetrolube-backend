import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AdminCommonModule } from '../common/common.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [AdminCommonModule, DatabaseModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
