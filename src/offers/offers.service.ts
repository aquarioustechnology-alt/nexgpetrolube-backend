import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferStatusDto, CounterOfferDto, UpdateOfferDetailsDto } from './dto/update-offer.dto';
import { OfferResponseDto, OfferHistoryResponseDto, OfferNotificationResponseDto } from './dto/offer-response.dto';
import { GetOffersQueryDto, GetOfferHistoryQueryDto, GetOfferNotificationsQueryDto } from './dto/get-offers.dto';
import { OfferStatus, OfferPriority, OfferAction, OfferNotificationType } from '@prisma/client';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async createOffer(userId: string, createOfferDto: CreateOfferDto): Promise<OfferResponseDto> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    // Get requirement details
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: createOfferDto.requirementId },
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
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    // Check if user is trying to offer on their own requirement
    if (requirement.userId === userId) {
      throw new ForbiddenException('Cannot create offer on your own requirement');
    }

    // Validate offeredUnitPrice based on negotiable type
    if (requirement.negotiableType === 'negotiable') {
      if (!createOfferDto.offeredUnitPrice || createOfferDto.offeredUnitPrice < 0.01) {
        throw new BadRequestException('Offer rate must be at least 0.01 for negotiable products');
      }
    } else {
      // For non-negotiable products, set offeredUnitPrice to requirement's unitPrice
      if (!createOfferDto.offeredUnitPrice) {
        createOfferDto.offeredUnitPrice = Number(requirement.unitPrice) || 0;
      }
    }

    // Check if requirement is still open
    if (requirement.status !== 'OPEN') {
      throw new BadRequestException('Cannot create offer on closed requirement');
    }

    // Check if user has already placed an offer on this requirement
    const existingOffer = await this.prisma.offer.findFirst({
      where: {
        requirementId: createOfferDto.requirementId,
        offerUserId: userId,
        deletedAt: null, // Only check non-deleted offers
      },
    });

    if (existingOffer) {
      throw new BadRequestException('You have already placed an offer on this requirement');
    }

    // Validate offered quantity against available quantity
    const offeredQuantity = parseFloat(createOfferDto.offeredQuantity);
    const availableQuantity = parseFloat(requirement.availableQuantity || '0');
    
    if (offeredQuantity > availableQuantity) {
      throw new BadRequestException(
        `Cannot create offer. Offered quantity (${offeredQuantity}) exceeds available quantity (${availableQuantity})`
      );
    }

    // Calculate offer expiry date based on negotiation window for negotiable requirements
    let offerExpiryDate: Date | null = null
    if (requirement.negotiableType === 'negotiable' && requirement.negotiationWindow) {
      const negotiationWindowHours = parseInt(requirement.negotiationWindow)
      offerExpiryDate = new Date()
      offerExpiryDate.setHours(offerExpiryDate.getHours() + negotiationWindowHours)
    }

    // Create the offer
    const offer = await this.prisma.offer.create({
      data: {
        requirementId: createOfferDto.requirementId,
        requirementOwnerType: requirement.userType,
        offeredUnitPrice: createOfferDto.offeredUnitPrice || 0,
        offeredQuantity: createOfferDto.offeredQuantity,
        requirementOwnerId: requirement.userId,
        offerUserId: userId,
        negotiableType: requirement.negotiableType || 'negotiable',
        postingType: requirement.postingType,
        negotiationWindow: requirement.negotiationWindow ? parseInt(requirement.negotiationWindow) : null,
        deadline: createOfferDto.deadline ? new Date(createOfferDto.deadline) : null,
        offerStatus: OfferStatus.PENDING,
        offerMessage: createOfferDto.offerMessage,
        offerExpiryDate: offerExpiryDate,
        minimumQuantity: createOfferDto.minimumQuantity,
        maximumQuantity: createOfferDto.maximumQuantity,
        deliveryTerms: createOfferDto.deliveryTerms,
        paymentTerms: createOfferDto.paymentTerms,
        validityPeriod: createOfferDto.validityPeriod,
        offerPriority: createOfferDto.offerPriority || OfferPriority.MEDIUM,
        isCounterOffer: false,
      },
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
        offerUser: {
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
    });

    // Create offer history entry
    await this.createOfferHistory(offer.id, userId, OfferAction.CREATED, 'Offer created');

    // Create notification for requirement owner
    await this.createOfferNotification(
      offer.id,
      requirement.userId,
      OfferNotificationType.NEW_OFFER,
    );

    return this.mapToOfferResponse(offer);
  }

  async getOffers(query: GetOffersQueryDto): Promise<{ offers: OfferResponseDto[]; total: number; page: number; limit: number }> {
    const { 
      page = 1, 
      limit = 10, 
      requirementId, 
      offerUserId, 
      requirementOwnerId, 
      offerStatus, 
      requirementOwnerType,
      postingType,
      negotiableType,
      isCounterOffer, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = query;

    // Ensure page and limit are numbers
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const where: any = {
      deletedAt: null,
    };

    if (requirementId) where.requirementId = requirementId;
    if (offerUserId) where.offerUserId = offerUserId;
    if (requirementOwnerId) where.requirementOwnerId = requirementOwnerId;
    if (offerStatus) where.offerStatus = offerStatus;
    if (requirementOwnerType) where.requirementOwnerType = requirementOwnerType;
    if (postingType) where.postingType = postingType;
    if (negotiableType) where.negotiableType = negotiableType;
    if (isCounterOffer !== undefined) where.isCounterOffer = isCounterOffer;

    if (search) {
      where.OR = [
        { offerMessage: { contains: search, mode: 'insensitive' } },
        { requirement: { title: { contains: search, mode: 'insensitive' } } },
        { requirement: { productName: { contains: search, mode: 'insensitive' } } },
        { offerUser: { companyName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
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
          offerUser: {
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
            },
          },
          parentOffer: true,
          counterOffers: true,
          // counterOffersList: {
          //   include: {
          //     fromUser: {
          //       select: {
          //         id: true,
          //         firstName: true,
          //         lastName: true,
          //         companyName: true,
          //         email: true,
          //       },
          //     },
          //   },
          //   orderBy: { createdAt: 'desc' },
          // },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.offer.count({ where }),
    ]);

    return {
      offers: offers.map(offer => this.mapToOfferResponse(offer)),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async getOfferById(id: string): Promise<OfferResponseDto> {
    const offer = await this.prisma.offer.findUnique({
      where: { id, deletedAt: null },
      include: {
        requirement: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            },
            subcategory: {
              select: {
                id: true,
                name: true
              }
            },
            product: {
              select: {
                id: true,
                name: true
              }
            },
            brand: {
              select: {
                id: true,
                name: true
              }
            },
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
        offerUser: {
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
          },
        },
        parentOffer: true,
        counterOffers: true,
        // counterOffersList: {
        //   include: {
        //     fromUser: {
        //       select: {
        //         id: true,
        //         firstName: true,
        //         lastName: true,
        //         companyName: true,
        //         email: true,
        //       },
        //     },
        //   },
        //   orderBy: { createdAt: 'desc' },
        // },
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return this.mapToOfferResponse(offer);
  }

  async updateOfferDetails(id: string, userId: string, updateDto: UpdateOfferDetailsDto): Promise<OfferResponseDto> {
    const offer = await this.prisma.offer.findUnique({
      where: { id, deletedAt: null },
      include: { requirement: true },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Check permissions - only the offer creator can update offer details
    if (offer.offerUserId !== userId) {
      throw new ForbiddenException('Not authorized to update this offer');
    }

    // Only allow updating pending offers
    if (offer.offerStatus !== OfferStatus.PENDING) {
      throw new BadRequestException('Only pending offers can be updated');
    }

    // Validate quantity if provided
    if (updateDto.offeredQuantity) {
      const offeredQuantity = parseFloat(updateDto.offeredQuantity);
      const availableQuantity = parseFloat(offer.requirement.availableQuantity || '0');
      
      if (isNaN(offeredQuantity) || offeredQuantity <= 0) {
        throw new BadRequestException('Invalid quantity provided');
      }
      
      if (offeredQuantity > availableQuantity) {
        throw new BadRequestException(`Quantity cannot exceed available quantity (${availableQuantity})`);
      }
    }

    const updatedOffer = await this.prisma.offer.update({
      where: { id },
      data: {
        ...(updateDto.offeredQuantity && { offeredQuantity: updateDto.offeredQuantity }),
        ...(updateDto.offerMessage !== undefined && { offerMessage: updateDto.offerMessage }),
        updatedAt: new Date(),
      },
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
        offerUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true,
          },
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
    });

    return this.mapToOfferResponse(updatedOffer);
  }

  async updateOfferStatus(id: string, userId: string, updateDto: UpdateOfferStatusDto): Promise<OfferResponseDto> {
    const offer = await this.prisma.offer.findUnique({
      where: { id, deletedAt: null },
      include: { requirement: true },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Check permissions
    const canUpdate = offer.offerUserId === userId || offer.requirementOwnerId === userId;
    if (!canUpdate) {
      throw new ForbiddenException('Not authorized to update this offer');
    }

    // Check if offer has expired for negotiable offers
    if (offer.negotiableType === 'negotiable' && offer.offerExpiryDate) {
      const now = new Date()
      if (now > offer.offerExpiryDate) {
        // Auto-reject expired offer
        await this.prisma.offer.update({
          where: { id },
          data: {
            offerStatus: OfferStatus.EXPIRED,
            updatedAt: new Date(),
          },
        })
        throw new BadRequestException(`This offer has expired. The negotiation window of ${offer.negotiationWindow} hours has passed.`)
      }
    }

    // Validate status transitions
    this.validateStatusTransition(offer.offerStatus, updateDto.action);

    // If accepting an offer, validate and reduce available quantity
    if (updateDto.action === OfferAction.ACCEPTED) {
      const currentAvailableQuantity = parseFloat(offer.requirement.availableQuantity || '0');
      const offeredQuantity = parseFloat(offer.offeredQuantity);
      
      // Validate that there's enough available quantity
      if (offeredQuantity > currentAvailableQuantity) {
        throw new BadRequestException(
          `Cannot accept offer. Offered quantity (${offeredQuantity}) exceeds available quantity (${currentAvailableQuantity})`
        );
      }
      
      const newAvailableQuantity = Math.max(0, currentAvailableQuantity - offeredQuantity);
      
      // Update requirement's available quantity
      await this.prisma.requirement.update({
        where: { id: offer.requirementId },
        data: {
          availableQuantity: newAvailableQuantity.toString(),
        },
      });
    }

    const updatedOffer = await this.prisma.offer.update({
      where: { id },
      data: {
        offerStatus: this.mapActionToStatus(updateDto.action),
        updatedAt: new Date(),
      },
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
        offerUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true,
          },
        },
        parentOffer: true,
        counterOffers: true,
      },
    });

    // Create offer history entry
    await this.createOfferHistory(id, userId, updateDto.action, updateDto.notes);

    // Create notification
    const notificationType = this.mapActionToNotificationType(updateDto.action);
    const recipientId = updateDto.action === OfferAction.ACCEPTED || updateDto.action === OfferAction.REJECTED 
      ? offer.offerUserId 
      : offer.requirementOwnerId;
    
    await this.createOfferNotification(id, recipientId, notificationType);

    return this.mapToOfferResponse(updatedOffer);
  }

  async createCounterOffer(parentOfferId: string, userId: string, counterOfferDto: CounterOfferDto): Promise<OfferResponseDto> {
    const parentOffer = await this.prisma.offer.findUnique({
      where: { id: parentOfferId, deletedAt: null },
      include: { requirement: true },
    });

    if (!parentOffer) {
      throw new NotFoundException('Parent offer not found');
    }

    // Check if user is the requirement owner (only requirement owner can counter)
    if (parentOffer.requirementOwnerId !== userId) {
      throw new ForbiddenException('Only requirement owner can create counter offers');
    }

    // Check if parent offer is still pending
    if (parentOffer.offerStatus !== OfferStatus.PENDING) {
      throw new BadRequestException('You can not counter on this offer.');
    }

    // Check if parent offer has expired
    if (parentOffer.negotiableType === 'negotiable' && parentOffer.offerExpiryDate) {
      const now = new Date()
      if (now > parentOffer.offerExpiryDate) {
        // Auto-reject expired parent offer
        await this.prisma.offer.update({
          where: { id: parentOfferId },
          data: {
            offerStatus: OfferStatus.EXPIRED,
            updatedAt: new Date(),
          },
        })
        throw new BadRequestException(`This offer has expired. The negotiation window of ${parentOffer.negotiationWindow} hours has passed.`)
      }
    }

    // Update parent offer status to COUNTERED
    await this.prisma.offer.update({
      where: { id: parentOfferId },
      data: { offerStatus: OfferStatus.COUNTERED },
    });

    // Counter offer inherits the same expiry date as the original offer
    // This ensures the entire negotiation window is consistent
    const counterOfferExpiryDate = parentOffer.offerExpiryDate

    // Create counter offer
    const counterOffer = await this.prisma.offer.create({
      data: {
        requirementId: parentOffer.requirementId,
        requirementOwnerType: parentOffer.requirementOwnerType,
        offeredUnitPrice: counterOfferDto.offeredUnitPrice,
        offeredQuantity: counterOfferDto.offeredQuantity,
        requirementOwnerId: parentOffer.requirementOwnerId,
        offerUserId: parentOffer.offerUserId,
        negotiableType: parentOffer.negotiableType,
        postingType: parentOffer.postingType,
        negotiationWindow: parentOffer.negotiationWindow,
        deadline: counterOfferDto.deadline ? new Date(counterOfferDto.deadline) : null,
        offerStatus: OfferStatus.PENDING,
        offerMessage: counterOfferDto.offerMessage,
        parentOfferId: parentOfferId,
        offerExpiryDate: counterOfferExpiryDate,
        minimumQuantity: counterOfferDto.minimumQuantity,
        maximumQuantity: counterOfferDto.maximumQuantity,
        deliveryTerms: counterOfferDto.deliveryTerms,
        paymentTerms: counterOfferDto.paymentTerms,
        validityPeriod: counterOfferDto.validityPeriod,
        offerPriority: counterOfferDto.offerPriority || OfferPriority.MEDIUM,
        isCounterOffer: true,
      },
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
        offerUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true,
          },
        },
        parentOffer: true,
        counterOffers: true,
      },
    });

    // Create offer history entries
    await this.createOfferHistory(parentOfferId, userId, OfferAction.COUNTERED, 'Counter offer created');
    await this.createOfferHistory(counterOffer.id, userId, OfferAction.CREATED, 'Counter offer created');

    // Create notification for original offerer
    await this.createOfferNotification(counterOffer.id, parentOffer.offerUserId, OfferNotificationType.COUNTER_OFFER);

    return this.mapToOfferResponse(counterOffer);
  }

  async getOfferHistory(query: GetOfferHistoryQueryDto): Promise<{ history: OfferHistoryResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, offerId, performedBy } = query;

    // Ensure page and limit are numbers
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const where: any = {};
    if (offerId) where.offerId = offerId;
    if (performedBy) where.performedBy = performedBy;

    const [history, total] = await Promise.all([
      this.prisma.offerHistory.findMany({
        where,
        include: {
          performer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              email: true,
            },
          },
        },
        orderBy: { performedAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.offerHistory.count({ where }),
    ]);

    return {
      history: history.map(h => ({
        id: h.id,
        offerId: h.offerId,
        action: h.action,
        performedBy: h.performedBy,
        performedAt: h.performedAt,
        notes: h.notes,
        oldValues: h.oldValues,
        newValues: h.newValues,
        performer: h.performer,
      })),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async getOfferNotifications(query: GetOfferNotificationsQueryDto): Promise<{ notifications: OfferNotificationResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, recipientId, isRead } = query;

    // Ensure page and limit are numbers
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const where: any = {};
    if (recipientId) where.recipientId = recipientId;
    if (isRead !== undefined) where.isRead = isRead;

    const [notifications, total] = await Promise.all([
      this.prisma.offerNotification.findMany({
        where,
        include: {
          offer: {
            select: {
              id: true,
              offeredUnitPrice: true,
              offeredQuantity: true,
              offerStatus: true,
            },
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.offerNotification.count({ where }),
    ]);

    return {
      notifications: notifications.map(n => ({
        id: n.id,
        offerId: n.offerId,
        recipientId: n.recipientId,
        notificationType: n.notificationType,
        isRead: n.isRead,
        createdAt: n.createdAt,
        offer: n.offer ? {
          id: n.offer.id,
          offeredUnitPrice: Number(n.offer.offeredUnitPrice),
          offeredQuantity: n.offer.offeredQuantity,
          offerStatus: n.offer.offerStatus,
        } : undefined,
        recipient: n.recipient,
      })),
      total,
      page: pageNum,
      limit: limitNum,
    };
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.prisma.offerNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException('Not authorized to update this notification');
    }

    await this.prisma.offerNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async deleteOffer(id: string, userId: string): Promise<void> {
    const offer = await this.prisma.offer.findUnique({
      where: { id, deletedAt: null },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Check permissions
    const canDelete = offer.offerUserId === userId || offer.requirementOwnerId === userId;
    if (!canDelete) {
      throw new ForbiddenException('Not authorized to delete this offer');
    }

    await this.prisma.offer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.createOfferHistory(id, userId, OfferAction.WITHDRAWN, 'Offer deleted');
  }

  private async createOfferHistory(offerId: string, performedBy: string, action: OfferAction, notes?: string): Promise<void> {
    await this.prisma.offerHistory.create({
      data: {
        offerId,
        action,
        performedBy,
        notes,
      },
    });
  }

  private async createOfferNotification(offerId: string, recipientId: string, notificationType: OfferNotificationType): Promise<void> {
    await this.prisma.offerNotification.create({
      data: {
        offerId,
        recipientId,
        notificationType,
      },
    });
  }

  private validateStatusTransition(currentStatus: OfferStatus, action: OfferAction): void {
    const validTransitions: Record<OfferStatus, OfferAction[]> = {
      [OfferStatus.PENDING]: [OfferAction.ACCEPTED, OfferAction.REJECTED, OfferAction.EXPIRED, OfferAction.WITHDRAWN, OfferAction.COUNTERED],
      [OfferStatus.ACCEPTED]: [],
      [OfferStatus.REJECTED]: [],
      [OfferStatus.EXPIRED]: [],
      [OfferStatus.WITHDRAWN]: [],
      [OfferStatus.COUNTERED]: [],
    };

    if (!validTransitions[currentStatus].includes(action)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${action}`);
    }
  }

  private mapActionToStatus(action: OfferAction): OfferStatus {
    const actionToStatusMap: Record<OfferAction, OfferStatus> = {
      [OfferAction.ACCEPTED]: OfferStatus.ACCEPTED,
      [OfferAction.REJECTED]: OfferStatus.REJECTED,
      [OfferAction.EXPIRED]: OfferStatus.EXPIRED,
      [OfferAction.WITHDRAWN]: OfferStatus.WITHDRAWN,
      [OfferAction.COUNTERED]: OfferStatus.COUNTERED,
      [OfferAction.CREATED]: OfferStatus.PENDING,
      [OfferAction.UPDATED]: OfferStatus.PENDING,
    };

    return actionToStatusMap[action] || OfferStatus.PENDING;
  }

  private mapActionToNotificationType(action: OfferAction): OfferNotificationType {
    const actionToNotificationMap: Record<OfferAction, OfferNotificationType> = {
      [OfferAction.ACCEPTED]: OfferNotificationType.OFFER_ACCEPTED,
      [OfferAction.REJECTED]: OfferNotificationType.OFFER_REJECTED,
      [OfferAction.EXPIRED]: OfferNotificationType.OFFER_EXPIRED,
      [OfferAction.COUNTERED]: OfferNotificationType.COUNTER_OFFER,
      [OfferAction.CREATED]: OfferNotificationType.NEW_OFFER,
      [OfferAction.UPDATED]: OfferNotificationType.NEW_OFFER,
      [OfferAction.WITHDRAWN]: OfferNotificationType.NEW_OFFER,
    };

    return actionToNotificationMap[action] || OfferNotificationType.NEW_OFFER;
  }

  private mapToOfferResponse(offer: any): OfferResponseDto {
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
      // Counteroffer fields
      counterofferCount: offer.counterofferCount || 0,
      originalPrice: offer.originalPrice ? Number(offer.originalPrice) : undefined,
      originalQuantity: offer.originalQuantity,
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
      // counterOffersList: offer.counterOffersList?.map((co: any) => ({
      //   id: co.id,
      //   counterofferNumber: co.counterofferNumber,
      //   offeredPrice: Number(co.offeredPrice),
      //   offeredQuantity: co.offeredQuantity,
      //   status: co.status,
      //   expiresAt: co.expiresAt,
      //   createdAt: co.createdAt,
      //   fromUser: co.fromUser,
      // })),
      counterOffersList: [],
      logistics: offer.logistics,
    };
  }
}
