import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { OfferStatus } from '@prisma/client';

@Injectable()
export class OffersCronService {
  private readonly logger = new Logger(OffersCronService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Runs every 5 minutes to check and auto-expire offers that have passed their negotiation window
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredOffers() {
    this.logger.log('Running expired offers check...');

    try {
      const now = new Date();

      // Find all pending offers that have expired
      const expiredOffers = await this.prisma.offer.findMany({
        where: {
          offerStatus: OfferStatus.PENDING,
          negotiableType: 'negotiable',
          offerExpiryDate: {
            lte: now, // Less than or equal to current time
          },
          deletedAt: null,
        },
        select: {
          id: true,
          negotiationWindow: true,
          offerExpiryDate: true,
          createdAt: true,
        },
      });

      if (expiredOffers.length === 0) {
        this.logger.log('No expired offers found');
        return;
      }

      this.logger.log(`Found ${expiredOffers.length} expired offers to auto-reject`);

      // Auto-reject all expired offers
      const updateResult = await this.prisma.offer.updateMany({
        where: {
          id: {
            in: expiredOffers.map(offer => offer.id),
          },
        },
        data: {
          offerStatus: OfferStatus.EXPIRED,
          updatedAt: now,
        },
      });

      this.logger.log(`Successfully auto-rejected ${updateResult.count} expired offers`);

      // Log details for each expired offer
      expiredOffers.forEach(offer => {
        this.logger.debug(
          `Offer ${offer.id} expired - Created: ${offer.createdAt}, ` +
          `Expiry: ${offer.offerExpiryDate}, Window: ${offer.negotiationWindow}h`
        );
      });
    } catch (error) {
      this.logger.error('Error processing expired offers:', error);
    }
  }
}

