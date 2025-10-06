import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OffersService } from '../../offers/offers.service';
import { RequirementOffersListingDto } from './dto/requirement-offers-listing.dto';
import { RequirementOffersListingResponseDto, PaginationMetaDto } from './dto';
import { OfferResponseDto } from '../../offers/dto/offer-response.dto';
import { UpdateOfferStatusDto } from '../../offers/dto/update-offer.dto';
import { OfferStatus } from '@prisma/client';

@Injectable()
export class AdminRequirementOffersService {
  constructor(
    private prisma: PrismaService,
    private offersService: OffersService
  ) {}

  async findAllForAdmin(listingDto: RequirementOffersListingDto): Promise<RequirementOffersListingResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      offerStatus,
      requirementOwnerType,
      postingType,
      negotiableType,
      isCounterOffer,
      requirementId,
      offerUserId,
      requirementOwnerId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = listingDto;

    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const where: any = {
      deletedAt: null,
    };
    
    if (offerStatus) {
      where.offerStatus = offerStatus;
    }
    
    if (requirementOwnerType) {
      where.requirementOwnerType = requirementOwnerType;
    }
    
    if (postingType) {
      where.postingType = postingType;
    }
    
    if (negotiableType) {
      where.negotiableType = negotiableType;
    }
    
    if (isCounterOffer !== undefined) {
      where.isCounterOffer = isCounterOffer;
    }
    
    if (requirementId) {
      where.requirementId = requirementId;
    }
    
    if (offerUserId) {
      where.offerUserId = offerUserId;
    }
    
    if (requirementOwnerId) {
      where.requirementOwnerId = requirementOwnerId;
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        { offerMessage: { contains: search, mode: 'insensitive' } },
        { 
          requirement: {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { productName: { contains: search, mode: 'insensitive' } },
              { brandName: { contains: search, mode: 'insensitive' } },
              { shortDescription: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        { 
          offerUser: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { companyName: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        { 
          requirementOwner: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { companyName: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        skip,
        take: limit,
        include: {
          requirement: {
            include: {
              category: true,
              subcategory: true,
              product: true,
              brand: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  companyName: true,
                  profileImage: true
                }
              }
            }
          },
          requirementOwner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              companyName: true,
              profileImage: true
            }
          },
          offerUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              companyName: true,
              profileImage: true
            }
          },
          parentOffer: true,
          counterOffers: true,
          logistics: {
            select: {
              id: true,
              driverPhone: true,
              truckNumber: true,
              logisticsCompany: true,
              estimatedDeliveryDate: true,
              status: true,
              createdAt: true,
            }
          }
        },
        orderBy
      }),
      this.prisma.offer.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationMetaDto = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return {
      data: offers.map(offer => this.mapToResponseDto(offer)),
      pagination
    };
  }

  async findOneForAdmin(id: string): Promise<OfferResponseDto> {
    const offer = await this.prisma.offer.findUnique({
      where: { id, deletedAt: null },
      include: {
        requirement: {
          include: {
            category: true,
            subcategory: true,
            product: true,
            brand: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                companyName: true,
                profileImage: true,
                addresses: true
              }
            }
          }
        },
        requirementOwner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            companyName: true,
            profileImage: true,
            addresses: true
          }
        },
        offerUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            companyName: true,
            profileImage: true,
            addresses: true
          }
        },
        parentOffer: true,
        counterOffers: true,
        logistics: {
          select: {
            id: true,
            driverPhone: true,
            truckNumber: true,
            logisticsCompany: true,
            estimatedDeliveryDate: true,
            status: true,
            createdAt: true,
          }
        }
      }
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return this.mapToResponseDto(offer);
  }

  async updateForAdmin(
    id: string,
    updateOfferDto: UpdateOfferStatusDto,
    adminId: string
  ): Promise<OfferResponseDto> {
    const offer = await this.prisma.offer.findUnique({
      where: { id, deletedAt: null },
      include: { requirement: true }
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Admin can update any offer status
    const updatedOffer = await this.prisma.offer.update({
      where: { id },
      data: {
        offerStatus: this.mapActionToStatus(updateOfferDto.action) as OfferStatus,
        updatedAt: new Date()
      },
      include: {
        requirement: {
          include: {
            category: true,
            subcategory: true,
            product: true,
            brand: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                companyName: true,
                profileImage: true
              }
            }
          }
        },
        requirementOwner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            companyName: true,
            profileImage: true
          }
        },
        offerUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            companyName: true,
            profileImage: true
          }
        },
        parentOffer: true,
        counterOffers: true,
        logistics: {
          select: {
            id: true,
            driverPhone: true,
            truckNumber: true,
            logisticsCompany: true,
            estimatedDeliveryDate: true,
            status: true,
            createdAt: true,
          }
        }
      }
    });

    // Create offer history entry for admin action
    await this.createOfferHistory(id, adminId, updateOfferDto.action, updateOfferDto.notes);

    return this.mapToResponseDto(updatedOffer);
  }

  async removeForAdmin(id: string, adminId: string): Promise<{ message: string }> {
    const offer = await this.prisma.offer.findUnique({
      where: { id, deletedAt: null }
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    await this.prisma.offer.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    // Create offer history entry for admin deletion
    await this.createOfferHistory(id, adminId, 'WITHDRAWN' as any, 'Offer deleted by admin');

    return { message: 'Offer deleted successfully' };
  }

  async getAdminStats(requirementOwnerType?: 'BUYER' | 'SELLER' | 'BOTH') {
    // Build base where clause for requirementOwnerType filtering
    const baseWhere = requirementOwnerType ? { requirementOwnerType } : {};
    
    const [
      totalOffers,
      pendingOffers,
      acceptedOffers,
      rejectedOffers,
      counteredOffers,
      expiredOffers,
      withdrawnOffers,
      recentOffers
    ] = await Promise.all([
      this.prisma.offer.count({ where: { ...baseWhere, deletedAt: null } }),
      this.prisma.offer.count({ where: { ...baseWhere, offerStatus: 'PENDING', deletedAt: null } }),
      this.prisma.offer.count({ where: { ...baseWhere, offerStatus: 'ACCEPTED', deletedAt: null } }),
      this.prisma.offer.count({ where: { ...baseWhere, offerStatus: 'REJECTED', deletedAt: null } }),
      this.prisma.offer.count({ where: { ...baseWhere, offerStatus: 'COUNTERED', deletedAt: null } }),
      this.prisma.offer.count({ where: { ...baseWhere, offerStatus: 'EXPIRED', deletedAt: null } }),
      this.prisma.offer.count({ where: { ...baseWhere, offerStatus: 'WITHDRAWN', deletedAt: null } }),
      this.prisma.offer.count({ 
        where: { 
          ...baseWhere,
          deletedAt: null,
          createdAt: { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          } 
        } 
      })
    ]);

    return {
      total: totalOffers,
      pending: pendingOffers,
      accepted: acceptedOffers,
      rejected: rejectedOffers,
      countered: counteredOffers,
      expired: expiredOffers,
      withdrawn: withdrawnOffers,
      recent: recentOffers
    };
  }

  private async createOfferHistory(offerId: string, performedBy: string, action: string, notes?: string): Promise<void> {
    await this.prisma.offerHistory.create({
      data: {
        offerId,
        action: action as any,
        performedBy,
        notes,
      },
    });
  }

  private mapActionToStatus(action: string): string {
    const actionToStatusMap: Record<string, string> = {
      'ACCEPTED': 'ACCEPTED',
      'REJECTED': 'REJECTED',
      'EXPIRED': 'EXPIRED',
      'WITHDRAWN': 'WITHDRAWN',
      'COUNTERED': 'COUNTERED',
      'CREATED': 'PENDING',
      'UPDATED': 'PENDING',
    };

    return actionToStatusMap[action] || 'PENDING';
  }

  private mapToResponseDto(offer: any): OfferResponseDto {
    return {
      id: offer.id,
      requirementId: offer.requirementId,
      requirementOwnerType: offer.requirementOwnerType,
      offeredUnitPrice: Number(offer.offeredUnitPrice),
      offeredQuantity: offer.offeredQuantity,
      requirementOwnerId: offer.requirementOwnerId,
      offerUserId: offer.offerUserId,
      negotiableType: offer.negotiableType,
      postingType: offer.postingType,
      negotiationWindow: offer.negotiationWindow,
      deadline: offer.deadline,
      offerStatus: offer.offerStatus,
      offerMessage: offer.offerMessage,
      parentOfferId: offer.parentOfferId,
      offerExpiryDate: offer.offerExpiryDate,
      minimumQuantity: offer.minimumQuantity,
      maximumQuantity: offer.maximumQuantity,
      deliveryTerms: offer.deliveryTerms,
      paymentTerms: offer.paymentTerms,
      validityPeriod: offer.validityPeriod,
      isCounterOffer: offer.isCounterOffer,
      offerPriority: offer.offerPriority,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      deletedAt: offer.deletedAt,
      // Payment status fields
      sellerPaymentStatus: offer.sellerPaymentStatus,
      buyerPaymentStatus: offer.buyerPaymentStatus,
      sellerPaymentId: offer.sellerPaymentId,
      buyerPaymentId: offer.buyerPaymentId,
      sellerPaidAt: offer.sellerPaidAt,
      buyerPaidAt: offer.buyerPaidAt,
      requirement: offer.requirement,
      requirementOwner: offer.requirementOwner,
      offerUser: offer.offerUser,
      parentOffer: offer.parentOffer,
      counterOffers: offer.counterOffers,
      logistics: offer.logistics,
    };
  }
}
