import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AdminBidsListingDto, AdminBidsListingResponseDto, AdminBidStatsDto, AdminBidResponseDto, PaginationMetaDto } from './dto';
import { BidStatus } from '@prisma/client';

@Injectable()
export class AdminBidsService {
  constructor(private prisma: PrismaService) {}

  async findAllForAdmin(listingDto: AdminBidsListingDto): Promise<AdminBidsListingResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      postingType,
      requirementId,
      bidderId,
      requirementOwnerId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = listingDto;

    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const where: any = {
      deletedAt: null,
    };
    
    if (status) {
      where.bidStatus = status.toUpperCase();
    }
    
    if (postingType) {
      where.requirement = {
        postingType: postingType,
      };
    }
    
    if (requirementId) {
      where.requirementId = requirementId;
    }
    
    if (bidderId) {
      where.bidUserId = bidderId;
    }
    
    if (requirementOwnerId) {
      where.requirement = {
        ...where.requirement,
        userId: requirementOwnerId,
      };
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        {
          bidMessage: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          requirement: {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          requirement: {
            productName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          bidUser: {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                companyName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'offeredUnitPrice') {
      orderBy.offeredUnitPrice = sortOrder;
    } else if (sortBy === 'bidStatus') {
      orderBy.bidStatus = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [bids, total] = await Promise.all([
      this.prisma.bid.findMany({
        where,
        include: {
          bidUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              email: true,
            },
          },
          requirement: {
            select: {
              id: true,
              title: true,
              postingType: true,
              productName: true,
              units: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.bid.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: bids.map(bid => this.mapToResponseDto(bid)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOneForAdmin(id: string): Promise<AdminBidResponseDto> {
    const bid = await this.prisma.bid.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
      include: {
        bidUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true,
          },
        },
        requirement: {
          select: {
            id: true,
            title: true,
            description: true,
            postingType: true,
            productName: true,
            units: true,
            quantity: true,
            unitPrice: true,
            status: true,
            urgency: true,
            deliveryMethod: true,
            deliveryTimeline: true,
            country: true,
            city: true,
            state: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true,
                email: true,
                phone: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            subcategory: {
              select: {
                id: true,
                name: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            brand: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentType: true,
            paymentStatus: true,
            paymentMethod: true,
            transactionId: true,
            processedAt: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true,
                email: true,
              },
            },
          },
        },
        logistics: {
          select: {
            id: true,
            trackingNumber: true,
            logisticsCompany: true,
            deliveryAddress: true,
            actualDeliveryDate: true,
            status: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    return this.mapToResponseDto(bid);
  }

  async updateForAdmin(id: string, updateData: { action: string; notes?: string }, adminId: string): Promise<AdminBidResponseDto> {
    const bid = await this.prisma.bid.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    const updatedBid = await this.prisma.bid.update({
      where: { id },
      data: {
        bidStatus: updateData.action as BidStatus,
        updatedAt: new Date(),
        // Add admin tracking if needed
      },
      include: {
        bidUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
          },
        },
        requirement: {
          select: {
            id: true,
            title: true,
            postingType: true,
            productName: true,
            units: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    return this.mapToResponseDto(updatedBid);
  }

  async removeForAdmin(id: string, adminId: string): Promise<void> {
    const bid = await this.prisma.bid.findUnique({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    await this.prisma.bid.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        // Add admin tracking if needed
      },
    });
  }

  async getAdminStats(postingType?: string): Promise<AdminBidStatsDto> {
    const where: any = {
      deletedAt: null,
    };

    if (postingType) {
      where.requirement = {
        postingType: postingType,
      };
    }

    const [total, active, won, lost, outbid] = await Promise.all([
      this.prisma.bid.count({ where }),
      this.prisma.bid.count({ 
        where: { 
          ...where, 
          bidStatus: BidStatus.ACTIVE 
        } 
      }),
      this.prisma.bid.count({ 
        where: { 
          ...where, 
          bidStatus: BidStatus.WON 
        } 
      }),
      this.prisma.bid.count({ 
        where: { 
          ...where, 
          bidStatus: BidStatus.LOST 
        } 
      }),
      this.prisma.bid.count({ 
        where: { 
          ...where, 
          bidStatus: BidStatus.OUTBID 
        } 
      }),
    ]);

    return {
      total,
      active,
      won,
      lost,
      outbid,
    };
  }

  private mapToResponseDto(bid: any): AdminBidResponseDto {
    return {
      id: bid.id,
      requirementId: bid.requirementId,
      userId: bid.bidUserId,
      amount: bid.offeredUnitPrice,
      quantity: bid.offeredQuantity,
      status: bid.bidStatus.toLowerCase(),
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
      sellerPaymentStatus: bid.sellerPaymentStatus,
      buyerPaymentStatus: bid.buyerPaymentStatus,
      allocatedQuantity: bid.allocatedQuantity,
      allocatedPercentage: bid.allocatedPercentage,
      originalPrice: bid.originalPrice,
      originalQuantity: bid.originalQuantity,
      user: bid.bidUser,
      requirement: bid.requirement,
      payments: bid.payments || [],
      logistics: bid.logistics || [],
    };
  }
}
