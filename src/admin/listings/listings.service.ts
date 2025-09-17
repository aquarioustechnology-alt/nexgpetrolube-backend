import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ListingListingDto, PaginatedListingResponseDto, ListingSubmissionResponseDto } from './dto/listing-listing.dto';
import { ListingApproveDto, ListingRejectDto, ListingActionResponseDto } from './dto/listing-action.dto';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async getListingsQueue(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { status: 'PENDING' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
          category: true,
          subcategory: true,
          brand: true,
          unit: true,
        },
        orderBy: { submittedAt: 'asc' },
      }),
      this.prisma.listing.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      data: listings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getListings(listingListingDto: ListingListingDto): Promise<PaginatedListingResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
      status,
      category,
      subcategory,
      role,
      isActive,
    } = listingListingDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.categoryId = category;
    }

    if (subcategory) {
      where.subcategoryId = subcategory;
    }

    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { companyName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { subcategory: { name: { contains: search, mode: 'insensitive' } } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (role) {
      where.user = { ...where.user, role };
    }

    if (typeof isActive === 'boolean') {
      where.user = { ...where.user, isActive };
    }

    // Execute queries in parallel
    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              companyName: true,
              phone: true,
              role: true,
              isActive: true,
            },
          },
          category: true,
          subcategory: true,
          brand: true,
          unit: true,
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    // Transform to response DTOs
    const listingResponses: ListingSubmissionResponseDto[] = listings.map(listing => ({
      id: listing.id,
      userId: listing.userId,
      companyName: listing.user.companyName,
      email: listing.user.email,
      phone: listing.user.phone || undefined,
      firstName: listing.user.firstName || '',
      lastName: listing.user.lastName || undefined,
      role: listing.user.role,
      productName: listing.title,
      description: listing.description,
      category: listing.category.name,
      subcategory: listing.subcategory?.name || undefined,
      brand: listing.brand?.name || undefined,
      quantity: listing.quantity?.toNumber() || 0,
      unit: listing.unit.name,
      pricePerUnit: listing.basePrice.toNumber(),
      minimumOrderQuantity: listing.moq ? parseInt(listing.moq) : undefined,
      maximumOrderQuantity: undefined,
      status: listing.status,
      submittedAt: listing.submittedAt,
      approvedAt: listing.approvedAt || undefined,
      approvedBy: listing.approvedBy || undefined,
      rejectionReason: listing.rejectionReason || undefined,
      isActive: listing.user.isActive,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      images: listing.images || undefined,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: listingResponses,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async approveListing(listingId: string, adminId: string): Promise<ListingActionResponseDto> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { user: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.status !== 'PENDING') {
      throw new BadRequestException('Listing is not in pending status');
    }

    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'APPROVED',
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'LISTING_APPROVED',
        entity: 'LISTING',
        entityId: listingId,
        // details: {
        //   listingId,
        //   previousStatus: 'PENDING',
        //   newStatus: 'APPROVED',
        // }, // TODO: Add details field to Prisma schema
        ipAddress: '127.0.0.1', // TODO: Get from request
        userAgent: 'Admin Panel', // TODO: Get from request
      },
    });

    return {
      success: true,
      message: 'Listing approved successfully',
      listingId,
      newStatus: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminId,
    };
  }

  async rejectListing(listingId: string, adminId: string, reason: string): Promise<ListingActionResponseDto> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { user: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.status !== 'PENDING') {
      throw new BadRequestException('Listing is not in pending status');
    }

    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'LISTING_REJECTED',
        entity: 'LISTING',
        entityId: listingId,
        // details: {
        //   listingId,
        //   previousStatus: 'PENDING',
        //   newStatus: 'REJECTED',
        //   reason,
        // }, // TODO: Add details field to Prisma schema
        ipAddress: '127.0.0.1', // TODO: Get from request
        userAgent: 'Admin Panel', // TODO: Get from request
      },
    });

    return {
      success: true,
      message: 'Listing rejected successfully',
      listingId,
      newStatus: 'REJECTED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminId,
    };
  }
}
