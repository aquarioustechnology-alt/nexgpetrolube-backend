import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { 
  CreateCounterOfferDto, 
  UpdateCounterOfferDto, 
  CounterOfferResponseDto, 
  AcceptCounterOfferDto,
  RejectCounterOfferDto,
  CounterOfferListResponseDto,
  CounterOfferStatus 
} from './dto/counter-offer.dto';

@Injectable()
export class CounterOffersService {
  constructor(private readonly prisma: PrismaService) {}

  async createCounterOffer(
    createCounterOfferDto: CreateCounterOfferDto,
    userId: string
  ): Promise<CounterOfferResponseDto> {
    const { offerId, offeredPrice, offeredQuantity } = createCounterOfferDto;

    // Get the original offer with requirement details
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        requirement: true,
        offerUser: true,
        requirementOwner: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Check if the offer is negotiable
    if (offer.negotiableType !== 'negotiable') {
      throw new BadRequestException('This offer is not negotiable');
    }

    // Check if the user is authorized to make counteroffers
    const isRequirementOwner = offer.requirementOwnerId === userId;
    const isOfferUser = offer.offerUserId === userId;
    
    if (!isRequirementOwner && !isOfferUser) {
      throw new ForbiddenException('You are not authorized to make counteroffers for this offer');
    }

    // Check if maximum counteroffers reached (10)
    if (offer.counterofferCount >= 10) {
      throw new BadRequestException('Maximum number of counteroffers has been reached');
    }

    // Check if offer is still active
    if (offer.offerStatus !== 'PENDING') {
      throw new BadRequestException('Cannot make counteroffers on non-pending offers');
    }

    // Validate counter offer quantity
    const requirementQuantity = parseFloat(offer.requirement.quantity || '0');
    const counterOfferQuantity = parseFloat(offeredQuantity);
    
    if (counterOfferQuantity <= 0) {
      throw new BadRequestException('Counter offer quantity must be greater than 0');
    }
    
    if (counterOfferQuantity > requirementQuantity) {
      throw new BadRequestException('Counter offer quantity cannot be more than requirement quantity');
    }

    // Calculate expiration time based on negotiation window
    const negotiationWindowHours = parseInt(offer.requirement.negotiationWindow || '24');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + negotiationWindowHours);

    // Create counteroffer
    const counterOffer = await this.prisma.counterOffer.create({
      data: {
        offerId,
        fromId: userId,
        requirementId: offer.requirementId,
        counterofferNumber: offer.counterofferCount + 1,
        offeredPrice,
        offeredQuantity,
        negotiationWindowHours,
        expiresAt,
        status: CounterOfferStatus.PENDING,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
          },
        },
        offer: {
          select: {
            id: true,
            offeredUnitPrice: true,
            offeredQuantity: true,
            offerStatus: true,
          },
        },
        requirement: {
          select: {
            id: true,
            title: true,
            negotiableType: true,
            negotiationWindow: true,
          },
        },
      },
    });

    // Update offer counteroffer count
    await this.prisma.offer.update({
      where: { id: offerId },
      data: {
        counterofferCount: offer.counterofferCount + 1,
      },
    });

    return this.mapToResponseDto(counterOffer);
  }

  async getCounterOffersByOffer(offerId: string): Promise<CounterOfferResponseDto[]> {
    const counterOffers = await this.prisma.counterOffer.findMany({
      where: { offerId },
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
          },
        },
        offer: {
          select: {
            id: true,
            offeredUnitPrice: true,
            offeredQuantity: true,
            offerStatus: true,
          },
        },
        requirement: {
          select: {
            id: true,
            title: true,
            negotiableType: true,
            negotiationWindow: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return counterOffers.map(counterOffer => this.mapToResponseDto(counterOffer));
  }

  async getCounterOffersByRequirement(
    requirementId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CounterOfferListResponseDto> {
    const skip = (page - 1) * limit;

    const [counterOffers, totalCount] = await Promise.all([
      this.prisma.counterOffer.findMany({
        where: { requirementId },
        include: {
          fromUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              email: true,
            },
          },
          offer: {
            select: {
              id: true,
              offeredUnitPrice: true,
              offeredQuantity: true,
              offerStatus: true,
            },
          },
          requirement: {
            select: {
              id: true,
              title: true,
              negotiableType: true,
              negotiationWindow: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.counterOffer.count({
        where: { requirementId },
      }),
    ]);

    return {
      counterOffers: counterOffers.map(counterOffer => this.mapToResponseDto(counterOffer)),
      totalCount,
      page,
      limit,
    };
  }

  async acceptCounterOffer(
    acceptCounterOfferDto: AcceptCounterOfferDto,
    userId: string
  ): Promise<CounterOfferResponseDto> {
    const { counterOfferId } = acceptCounterOfferDto;

    // Get counteroffer with offer details
    const counterOffer = await this.prisma.counterOffer.findUnique({
      where: { id: counterOfferId },
      include: {
        offer: {
          include: {
            requirementOwner: true,
            offerUser: true,
          },
        },
      },
    });

    if (!counterOffer) {
      throw new NotFoundException('Counteroffer not found');
    }

    // Check if counteroffer is still pending
    if (counterOffer.status !== CounterOfferStatus.PENDING) {
      throw new BadRequestException('Counteroffer is no longer pending');
    }

    // Check if counteroffer has expired
    if (new Date() > counterOffer.expiresAt) {
      throw new BadRequestException('Counteroffer has expired');
    }

    // Check if the main offer has expired (for negotiable offers)
    if (counterOffer.offer.negotiableType === 'negotiable' && counterOffer.offer.offerExpiryDate) {
      const now = new Date();
      if (now > counterOffer.offer.offerExpiryDate) {
        // Auto-reject expired offer
        await this.prisma.offer.update({
          where: { id: counterOffer.offerId },
          data: {
            offerStatus: 'EXPIRED',
            updatedAt: new Date(),
          },
        });
        throw new BadRequestException(`This offer has expired. The negotiation window of ${counterOffer.offer.negotiationWindow} hours has passed.`);
      }
    }

    // Check authorization - only the other party can accept
    const isRequirementOwner = counterOffer.offer.requirementOwnerId === userId;
    const isOfferUser = counterOffer.offer.offerUserId === userId;
    
    if (!isRequirementOwner && !isOfferUser) {
      throw new ForbiddenException('You are not authorized to accept this counteroffer');
    }

    // Check if the user is not the one who made the counteroffer
    if (counterOffer.fromId === userId) {
      throw new BadRequestException('You cannot accept your own counteroffer');
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Update counteroffer status
      const updatedCounterOffer = await tx.counterOffer.update({
        where: { id: counterOfferId },
        data: { status: CounterOfferStatus.ACCEPTED },
        include: {
          fromUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              email: true,
            },
          },
          offer: {
            select: {
              id: true,
              offeredUnitPrice: true,
              offeredQuantity: true,
              offerStatus: true,
            },
          },
          requirement: {
            select: {
              id: true,
              title: true,
              negotiableType: true,
              negotiationWindow: true,
            },
          },
        },
      });

      // Update the main offer with counteroffer details
      await tx.offer.update({
        where: { id: counterOffer.offerId },
        data: {
          // Store original values if not already stored
          originalPrice: counterOffer.offer.originalPrice || counterOffer.offer.offeredUnitPrice,
          originalQuantity: counterOffer.offer.originalQuantity || counterOffer.offer.offeredQuantity,
          // Update with counteroffer values
          offeredUnitPrice: counterOffer.offeredPrice,
          offeredQuantity: counterOffer.offeredQuantity,
          offerStatus: 'ACCEPTED',
        },
      });

      // Reject all other pending counteroffers for this offer
      await tx.counterOffer.updateMany({
        where: {
          offerId: counterOffer.offerId,
          id: { not: counterOfferId },
          status: CounterOfferStatus.PENDING,
        },
        data: { status: CounterOfferStatus.REJECTED },
      });

      return updatedCounterOffer;
    });

    return this.mapToResponseDto(result);
  }

  async rejectCounterOffer(
    rejectCounterOfferDto: RejectCounterOfferDto,
    userId: string
  ): Promise<CounterOfferResponseDto> {
    const { counterOfferId, reason } = rejectCounterOfferDto;

    // Get counteroffer with offer details
    const counterOffer = await this.prisma.counterOffer.findUnique({
      where: { id: counterOfferId },
      include: {
        offer: {
          include: {
            requirementOwner: true,
            offerUser: true,
          },
        },
      },
    });

    if (!counterOffer) {
      throw new NotFoundException('Counteroffer not found');
    }

    // Check if counteroffer is still pending
    if (counterOffer.status !== CounterOfferStatus.PENDING) {
      throw new BadRequestException('Counteroffer is no longer pending');
    }

    // Check authorization - only the other party can reject
    const isRequirementOwner = counterOffer.offer.requirementOwnerId === userId;
    const isOfferUser = counterOffer.offer.offerUserId === userId;
    
    if (!isRequirementOwner && !isOfferUser) {
      throw new ForbiddenException('You are not authorized to reject this counteroffer');
    }

    // Check if the user is not the one who made the counteroffer
    if (counterOffer.fromId === userId) {
      throw new BadRequestException('You cannot reject your own counteroffer');
    }

    // Use transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Update counteroffer status
      const updatedCounterOffer = await tx.counterOffer.update({
        where: { id: counterOfferId },
        data: { status: CounterOfferStatus.REJECTED },
        include: {
          fromUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              email: true,
            },
          },
          offer: {
            select: {
              id: true,
              offeredUnitPrice: true,
              offeredQuantity: true,
              offerStatus: true,
            },
          },
          requirement: {
            select: {
              id: true,
              title: true,
              negotiableType: true,
              negotiationWindow: true,
            },
          },
        },
      });

      // Update the main offer status to rejected
      await tx.offer.update({
        where: { id: counterOffer.offerId },
        data: {
          offerStatus: 'REJECTED',
        },
      });

      return updatedCounterOffer;
    });

    return this.mapToResponseDto(result);
  }

  async updateCounterOffer(
    counterOfferId: string,
    updateCounterOfferDto: UpdateCounterOfferDto,
    userId: string
  ): Promise<CounterOfferResponseDto> {
    // Get counteroffer
    const counterOffer = await this.prisma.counterOffer.findUnique({
      where: { id: counterOfferId },
      include: {
        offer: true,
      },
    });

    if (!counterOffer) {
      throw new NotFoundException('Counteroffer not found');
    }

    // Check if user is the one who made the counteroffer
    if (counterOffer.fromId !== userId) {
      throw new ForbiddenException('You can only update your own counteroffers');
    }

    // Check if counteroffer is still pending
    if (counterOffer.status !== CounterOfferStatus.PENDING) {
      throw new BadRequestException('Cannot update non-pending counteroffers');
    }

    // Check if counteroffer has expired
    if (new Date() > counterOffer.expiresAt) {
      throw new BadRequestException('Counteroffer has expired');
    }

    // Update counteroffer
    const updatedCounterOffer = await this.prisma.counterOffer.update({
      where: { id: counterOfferId },
      data: updateCounterOfferDto,
      include: {
        fromUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
          },
        },
        offer: {
          select: {
            id: true,
            offeredUnitPrice: true,
            offeredQuantity: true,
            offerStatus: true,
          },
        },
        requirement: {
          select: {
            id: true,
            title: true,
            negotiableType: true,
            negotiationWindow: true,
          },
        },
      },
    });

    return this.mapToResponseDto(updatedCounterOffer);
  }

  async deleteCounterOffer(counterOfferId: string, userId: string): Promise<void> {
    // Get counteroffer
    const counterOffer = await this.prisma.counterOffer.findUnique({
      where: { id: counterOfferId },
      include: {
        offer: true,
      },
    });

    if (!counterOffer) {
      throw new NotFoundException('Counteroffer not found');
    }

    // Check if user is the one who made the counteroffer
    if (counterOffer.fromId !== userId) {
      throw new ForbiddenException('You can only delete your own counteroffers');
    }

    // Check if counteroffer is still pending
    if (counterOffer.status !== CounterOfferStatus.PENDING) {
      throw new BadRequestException('Cannot delete non-pending counteroffers');
    }

    // Use transaction to ensure data consistency
    await this.prisma.$transaction(async (tx) => {
      // Delete counteroffer
      await tx.counterOffer.delete({
        where: { id: counterOfferId },
      });

      // Update offer counteroffer count
      await tx.offer.update({
        where: { id: counterOffer.offerId },
        data: {
          counterofferCount: {
            decrement: 1,
          },
        },
      });
    });
  }

  async expireCounterOffers(): Promise<void> {
    // Find all expired pending counteroffers
    const expiredCounterOffers = await this.prisma.counterOffer.findMany({
      where: {
        status: CounterOfferStatus.PENDING,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Update status to expired
    if (expiredCounterOffers.length > 0) {
      await this.prisma.counterOffer.updateMany({
        where: {
          id: {
            in: expiredCounterOffers.map(co => co.id),
          },
        },
        data: {
          status: CounterOfferStatus.EXPIRED,
        },
      });
    }
  }

  private mapToResponseDto(counterOffer: any): CounterOfferResponseDto {
    return {
      id: counterOffer.id,
      offerId: counterOffer.offerId,
      fromId: counterOffer.fromId,
      requirementId: counterOffer.requirementId,
      counterofferNumber: counterOffer.counterofferNumber,
      offeredPrice: Number(counterOffer.offeredPrice),
      offeredQuantity: counterOffer.offeredQuantity,
      status: counterOffer.status,
      negotiationWindowHours: counterOffer.negotiationWindowHours,
      expiresAt: counterOffer.expiresAt,
      createdAt: counterOffer.createdAt,
      updatedAt: counterOffer.updatedAt,
      fromUser: counterOffer.fromUser,
      offer: counterOffer.offer,
      requirement: counterOffer.requirement,
    };
  }
}
