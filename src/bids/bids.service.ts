import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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

    // Check if bidding is currently active based on start/end date and time
    if (requirement.postingType === 'REVERSE_BIDDING' || requirement.postingType === 'STANDARD_BIDDING') {
      const now = new Date();
      
      // Parse bidding start date and time
      let biddingStartDateTime: Date | null = null;
      if (requirement.biddingStartDate && requirement.biddingStartTime) {
        try {
          biddingStartDateTime = new Date(`${requirement.biddingStartDate}T${requirement.biddingStartTime}`);
        } catch (error) {
          console.error('Error parsing bidding start date/time:', error);
        }
      }
      
      // Parse bidding end date and time
      let biddingEndDateTime: Date | null = null;
      if (requirement.biddingEndDate && requirement.biddingEndTime) {
        try {
          biddingEndDateTime = new Date(`${requirement.biddingEndDate}T${requirement.biddingEndTime}`);
        } catch (error) {
          console.error('Error parsing bidding end date/time:', error);
        }
      }
      
      // If bidding dates are provided, validate them
      if (biddingStartDateTime && biddingEndDateTime) {
        if (now < biddingStartDateTime) {
          throw new BadRequestException(`Bidding has not started yet. Bidding will start on ${requirement.biddingStartDate} at ${requirement.biddingStartTime}`);
        }
        
        if (now > biddingEndDateTime) {
          throw new BadRequestException(`Bidding has ended. Bidding ended on ${requirement.biddingEndDate} at ${requirement.biddingEndTime}`);
        }
      }
    }

    // Check if there are any approved or allocated bids for this requirement
    const existingApprovedBids = await this.prisma.bid.findFirst({
      where: {
        requirementId: createBidDto.requirementId,
        bidStatus: {
          in: ['WON'] // Check for approved/allocated bids
        }
      }
    });

    if (existingApprovedBids) {
      throw new BadRequestException('This requirement already has approved/allocated bids. No new bids can be submitted.');
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
        },
        logistics: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return bids.map(bid => this.mapToResponseDto(bid));
  }

  async getBidResults(requirementId: string) {
    // First get the requirement to determine posting type
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: requirementId },
      select: { postingType: true }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

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
        },
      },
      orderBy: [
        // First sort by bid status - WON bids first
        { bidStatus: 'desc' },
        // Then sort by amount based on posting type
        requirement.postingType === 'STANDARD_BIDDING' 
          ? { offeredUnitPrice: 'desc' }  // Highest amount first for standard bidding
          : { offeredUnitPrice: 'asc' }   // Lowest amount first for reverse bidding
      ],
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

  async getMyBids(userId: string, options: { page: number; limit: number; sortBy: string; sortOrder: 'asc' | 'desc'; postingType?: string }) {
    const { page, limit, sortBy, sortOrder, postingType } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      bidUserId: userId,
    };

    // Add postingType filter if provided
    if (postingType) {
      whereClause.requirement = {
        postingType: postingType,
      };
    }

    const [bids, total] = await Promise.all([
      this.prisma.bid.findMany({
        where: whereClause,
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
              productName: true,
              units: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  companyName: true,
                }
              }
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.bid.count({
        where: whereClause,
      }),
    ]);

    return {
      data: bids.map(bid => this.mapToResponseDto(bid)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async acceptBid(bidId: string, userId: string, notes?: string): Promise<BidResponseDto> {
    // Find the bid with requirement details
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
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
            userId: true, // Requirement owner
          }
        }
      }
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    // Check if the user is the requirement owner
    if (bid.requirement.userId !== userId) {
      throw new ForbiddenException('Only the requirement owner can accept bids');
    }

    // Check if bid is still active
    if (bid.bidStatus !== 'ACTIVE') {
      throw new BadRequestException('Only active bids can be accepted');
    }

    // Update the bid status to WON
    const updatedBid = await this.prisma.bid.update({
      where: { id: bidId },
      data: {
        bidStatus: 'WON',
        updatedAt: new Date(),
        // Store acceptance notes if provided
        ...(notes && { bidMessage: notes }),
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

    // Update all other bids for this requirement to LOST status
    await this.prisma.bid.updateMany({
      where: {
        requirementId: bid.requirementId,
        id: { not: bidId },
        bidStatus: 'ACTIVE'
      },
      data: {
        bidStatus: 'LOST',
        updatedAt: new Date(),
      }
    });

    // Close the requirement since a bid has been accepted
    await this.prisma.requirement.update({
      where: { id: bid.requirementId },
      data: {
        status: 'CLOSED',
        updatedAt: new Date(),
      }
    });

    return this.mapToResponseDto(updatedBid);
  }

  async rejectBid(bidId: string, userId: string, reason?: string): Promise<BidResponseDto> {
    // Find the bid with requirement details
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
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
            userId: true, // Requirement owner
          }
        }
      }
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    // Check if the user is the requirement owner
    if (bid.requirement.userId !== userId) {
      throw new ForbiddenException('Only the requirement owner can reject bids');
    }

    // Check if bid is still active
    if (bid.bidStatus !== 'ACTIVE') {
      throw new BadRequestException('Only active bids can be rejected');
    }

    // Update the bid status to LOST
    const updatedBid = await this.prisma.bid.update({
      where: { id: bidId },
      data: {
        bidStatus: 'LOST',
        updatedAt: new Date(),
        // Store rejection reason if provided
        ...(reason && { bidMessage: reason }),
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

    return this.mapToResponseDto(updatedBid);
  }

  async getBidById(id: string): Promise<BidResponseDto> {
    const bid = await this.prisma.bid.findUnique({
      where: { id },
      include: {
        requirement: {
          include: {
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
          },
        },
        requirementOwner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true,
          },
        },
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
        logistics: {
          select: {
            id: true,
            driverPhone: true,
            truckNumber: true,
            logisticsCompany: true,
            estimatedDeliveryDate: true,
            status: true,
            createdAt: true,
            invoiceCopy: true,
            biltyCopy: true,
            insurance: true,
            notes: true,
            trackingId: true,
            actualPickupDate: true,
            actualDeliveryDate: true,
          },
        },
        payments: {
          select: {
            id: true,
            paymentType: true,
            paymentStatus: true,
            amount: true,
            userId: true,
            createdAt: true,
            processedAt: true,
          },
        },
      },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    return this.mapToResponseDto(bid);
  }

  private mapToResponseDto(bid: any): BidResponseDto {
    return {
      id: bid.id,
      requirementId: bid.requirementId,
      userId: bid.bidUserId,
      amount: bid.offeredUnitPrice,
      quantity: bid.offeredQuantity,
      status: bid.bidStatus,
      isWinning: bid.bidStatus === 'WON', // Set isWinning based on status
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
      sellerPaymentStatus: bid.sellerPaymentStatus || 'PENDING',
      buyerPaymentStatus: bid.buyerPaymentStatus || 'PENDING',
      // Additional fields for detailed view
      requirementOwner: bid.requirementOwner,
      requirementOwnerType: bid.requirementOwnerType,
      logistics: bid.logistics || [],
      payments: bid.payments || [],
    };
  }

  async allocateBids(requirementId: string, allocations: { [bidId: string]: number }, userId: string, quantities?: { [bidId: string]: number }): Promise<{ message: string; allocatedBids: BidResponseDto[] }> {
    // Verify requirement exists and user is the owner
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: requirementId },
      select: { userId: true, title: true, postingType: true }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    if (requirement.userId !== userId) {
      throw new ForbiddenException('Only the requirement owner can allocate bids');
    }

    // Validate allocations total 100%
    const totalAllocation = Object.values(allocations).reduce((sum, allocation) => sum + allocation, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) { // Allow small floating point differences
      throw new BadRequestException('Total allocation must equal 100%');
    }

    // Get all bids for this requirement
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
      }
    });

    if (bids.length === 0) {
      throw new BadRequestException('No bids found for this requirement');
    }

    // Validate all bid IDs exist
    const bidIds = Object.keys(allocations);
    const existingBidIds = bids.map(bid => bid.id);
    const invalidBidIds = bidIds.filter(id => !existingBidIds.includes(id));
    
    if (invalidBidIds.length > 0) {
      throw new BadRequestException(`Invalid bid IDs: ${invalidBidIds.join(', ')}`);
    }

    // Update bids in a transaction
    const updatedBids = await this.prisma.$transaction(async (prisma) => {
      const results: any[] = [];

      for (const [bidId, allocation] of Object.entries(allocations)) {
        if (allocation > 0) {
          // Get the original bid data
          const originalBid = bids.find(b => b.id === bidId)
          if (!originalBid) continue

          // Calculate allocated quantity if not provided
          const allocatedQuantity = quantities?.[bidId] || Math.round((parseFloat(requirement.title.split(' ')[0]) || 100) * allocation / 100)

          // Mark this bid as WON and save original values
          const updatedBid = await prisma.bid.update({
            where: { id: bidId },
            data: {
              bidStatus: 'WON',
              // Save original values for reference
              originalPrice: originalBid.offeredUnitPrice,
              originalQuantity: originalBid.offeredQuantity,
              // Update allocated quantity based on percentage
              offeredQuantity: allocatedQuantity.toString(), // Update the main quantity field
              updatedAt: new Date(),
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
          results.push(updatedBid);
        } else {
          // Mark unallocated bids as LOST
          await prisma.bid.update({
            where: { id: bidId },
            data: {
              bidStatus: 'LOST',
              updatedAt: new Date(),
            }
          });
        }
      }

      return results;
    });

    // Close the requirement since bids have been allocated
    await this.prisma.requirement.update({
      where: { id: requirementId },
      data: {
        status: 'CLOSED',
        updatedAt: new Date(),
      }
    });

    return {
      message: `Successfully allocated bids to ${updatedBids.length} supplier(s)`,
      allocatedBids: updatedBids.map(bid => this.mapToResponseDto(bid))
    };
  }
}
