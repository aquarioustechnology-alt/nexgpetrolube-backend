import { Module } from '@nestjs/common';
import { AdminRequirementsController } from './requirements.controller';
import { AdminRequirementsService } from './requirements.service';
import { RequirementsModule } from '../../requirements/requirements.module';

@Module({
  imports: [RequirementsModule],
  controllers: [AdminRequirementsController],
  providers: [AdminRequirementsService],
  exports: [AdminRequirementsService],
})
export class AdminRequirementsModule {}
