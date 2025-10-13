import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidResponseDto } from './dto/create-bid.dto';

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {}

  async createBid(createBidDto: CreateBidDto, userId: string): Promise<BidResponseDto> {
    // Verify requirement exists and is active
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: createBidDto.requirementId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          }
        }
      }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    if (requirement.status !== 'OPEN') {
      throw new BadRequestException('Cannot bid on closed requirements');
    }

    // Check if user is trying to bid on their own requirement
    if (requirement.userId === userId) {
      throw new BadRequestException('Cannot bid on your own requirement');
    }

    // Check if user already has a bid on this requirement
    const existingBid = await this.prisma.bid.findFirst({
      where: {
        requirementId: createBidDto.requirementId,
        bidUserId: userId,
      }
    });

    if (existingBid) {
      throw new BadRequestException('You have already placed a bid on this requirement');
    }

    // Create the bid
    const bid = await this.prisma.bid.create({
      data: {
        requirementId: createBidDto.requirementId,
        requirementOwnerType: requirement.userType,
        offeredUnitPrice: createBidDto.amount,
        offeredQuantity: createBidDto.quantity,
        requirementOwnerId: requirement.userId,
        bidUserId: userId,
        negotiableType: requirement.negotiableType || 'negotiable',
        postingType: requirement.postingType,
        negotiationWindow: createBidDto.negotiationWindow,
        deadline: createBidDto.deadline ? new Date(createBidDto.deadline) : null,
        bidStatus: 'ACTIVE',
        bidMessage: createBidDto.notes,
        bidExpiryDate: createBidDto.validityPeriod ? new Date(Date.now() + createBidDto.validityPeriod * 24 * 60 * 60 * 1000) : null,
        minimumQuantity: createBidDto.minimumQuantity,
        maximumQuantity: createBidDto.maximumQuantity,
        deliveryTerms: createBidDto.deliveryTerms,
        paymentTerms: createBidDto.paymentTerms,
        validityPeriod: createBidDto.validityPeriod,
        bidPriority: createBidDto.offerPriority || 'MEDIUM',
        isCounterBid: false,
        counterbidCount: 0,
        sellerPaymentStatus: 'PENDING',
        buyerPaymentStatus: 'PENDING',
      },
      include: {
        bidUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          }
        },
        requirement: {
          select: {
            id: true,
            title: true,
            postingType: true,
          }
        }
      }
    });

    // Update requirement's current bid and bidders count
    await this.prisma.requirement.update({
      where: { id: createBidDto.requirementId },
      data: {
        currentBid: createBidDto.amount,
        biddersCount: {
          increment: 1,
        },
      }
    });

    return this.mapToResponseDto(bid);
  }

  async findAll() {
    const bids = await this.prisma.bid.findMany({
      include: {
        bidUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          }
        },
        requirement: {
          select: {
            id: true,
            title: true,
            postingType: true,
          }
        }
      },
    });
    return bids.map(bid => this.mapToResponseDto(bid));
  }

  async getBidsByRequirement(requirementId: string) {
    const bids = await this.prisma.bid.findMany({
      where: { requirementId },
      include: {
        bidUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          }
        },
        requirement: {
          select: {
            id: true,
            title: true,
            postingType: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return bids.map(bid => this.mapToResponseDto(bid));
  }

  async getHighestBid(requirementId: string): Promise<BidResponseDto | null> {
    const highestBid = await this.prisma.bid.findFirst({
      where: {
        requirementId: requirementId,
        bidStatus: 'ACTIVE',
      },
      include: {
        bidUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          }
        },
        requirement: {
          select: {
            id: true,
            title: true,
            postingType: true,
          }
        }
      },
      orderBy: { offeredUnitPrice: 'desc' },
    });

    return highestBid ? this.mapToResponseDto(highestBid) : null;
  }

  async getLowestBid(requirementId: string): Promise<BidResponseDto | null> {
    const lowestBid = await this.prisma.bid.findFirst({
      where: {
        requirementId: requirementId,
        bidStatus: 'ACTIVE',
      },
      include: {
        bidUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          }
        },
        requirement: {
          select: {
            id: true,
            title: true,
            postingType: true,
          }
        }
      },
      orderBy: { offeredUnitPrice: 'asc' },
    });

    return lowestBid ? this.mapToResponseDto(lowestBid) : null;
  }

  private mapToResponseDto(bid: any): BidResponseDto {
    return {
      id: bid.id,
      requirementId: bid.requirementId,
      userId: bid.bidUserId,
      amount: bid.offeredUnitPrice,
      quantity: bid.offeredQuantity,
      status: bid.bidStatus,
      isWinning: false, // This would need to be calculated based on business logic
      notes: bid.bidMessage,
      placedAt: bid.createdAt,
      negotiationWindow: bid.negotiationWindow,
      deadline: bid.deadline,
      minimumQuantity: bid.minimumQuantity,
      maximumQuantity: bid.maximumQuantity,
      deliveryTerms: bid.deliveryTerms,
      paymentTerms: bid.paymentTerms,
      validityPeriod: bid.validityPeriod,
      offerPriority: bid.bidPriority,
      user: bid.bidUser,
      requirement: bid.requirement,
    };
  }
}
