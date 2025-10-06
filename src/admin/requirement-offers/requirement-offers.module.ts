import { Module } from '@nestjs/common';
import { AdminRequirementOffersService } from './requirement-offers.service';
import { AdminRequirementOffersController } from './requirement-offers.controller';
import { PrismaService } from '../../database/prisma.service';
import { OffersService } from '../../offers/offers.service';
import { OffersModule } from '../../offers/offers.module';

@Module({
  imports: [OffersModule],
  controllers: [AdminRequirementOffersController],
  providers: [AdminRequirementOffersService, PrismaService],
  exports: [AdminRequirementOffersService],
})
export class AdminRequirementOffersModule {}

