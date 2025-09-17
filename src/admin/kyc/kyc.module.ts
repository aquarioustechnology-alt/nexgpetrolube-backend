import { Module } from '@nestjs/common';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { AdminCommonModule } from '../common/common.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [AdminCommonModule, DatabaseModule],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
