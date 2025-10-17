import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { CounterOffersService } from './counter-offers.service';
import { OffersCronService } from './offers-cron.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [OffersController],
  providers: [OffersService, CounterOffersService, OffersCronService, PrismaService],
  exports: [OffersService, CounterOffersService],
})
export class OffersModule {}
