import { Module } from '@nestjs/common';
import { AdminBidsController } from './bids.controller';
import { AdminBidsService } from './bids.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [AdminBidsController],
  providers: [AdminBidsService, PrismaService],
  exports: [AdminBidsService],
})
export class AdminBidsModule {}
