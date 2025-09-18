import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RequirementsService } from '../../requirements/requirements.service';
import { RequirementsListingDto } from './dto/requirements-listing.dto';
import { RequirementsListingResponseDto, PaginationMetaDto } from './dto/requirements-listing-response.dto';
import { RequirementResponseDto } from '../../requirements/dto/requirement-response.dto';
import { UpdateRequirementDto } from '../../requirements/dto/update-requirement.dto';

@Injectable()
export class AdminRequirementsService {
  constructor(
    private prisma: PrismaService,
    private requirementsService: RequirementsService
  ) {}

  async findAllForAdmin(listingDto: RequirementsListingDto): Promise<RequirementsListingResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      adminStatus,
      postingType,
      categoryId,
      subcategoryId,
      userType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = listingDto;

    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (adminStatus) {
      where.adminStatus = adminStatus;
    }
    
    if (postingType) {
      where.postingType = postingType;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    }
    
    if (userType) {
      where.userType = userType;
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { detailedDescription: { contains: search, mode: 'insensitive' } },
        { 
          user: {
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

    const [requirements, total] = await Promise.all([
      this.prisma.requirement.findMany({
        where,
        skip,
        take: limit,
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
        },
        orderBy
      }),
      this.prisma.requirement.count({ where })
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
      data: requirements.map(req => this.mapToResponseDto(req)),
      pagination
    };
  }

  async findOneForAdmin(id: string): Promise<RequirementResponseDto> {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
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
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    return this.mapToResponseDto(requirement);
  }

  async updateForAdmin(
    id: string,
    updateRequirementDto: UpdateRequirementDto,
    adminId: string
  ): Promise<RequirementResponseDto> {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    const updatedRequirement = await this.prisma.requirement.update({
      where: { id },
      data: {
        ...updateRequirementDto,
        updatedAt: new Date()
      },
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
    });

    return this.mapToResponseDto(updatedRequirement);
  }

  async removeForAdmin(id: string, adminId: string): Promise<{ message: string }> {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    await this.prisma.requirement.delete({
      where: { id }
    });

    return { message: 'Requirement deleted successfully' };
  }

  async approveRequirement(id: string, adminId: string): Promise<RequirementResponseDto> {
    return this.requirementsService.approveRequirement(id, adminId);
  }

  async rejectRequirement(id: string, rejectionReason: string, adminId: string): Promise<RequirementResponseDto> {
    return this.requirementsService.rejectRequirement(id, rejectionReason, adminId);
  }

  async getAdminStats() {
    const [
      totalRequirements,
      pendingRequirements,
      approvedRequirements,
      rejectedRequirements,
      draftRequirements,
      openRequirements,
      closedRequirements,
      recentRequirements
    ] = await Promise.all([
      this.prisma.requirement.count(),
      this.prisma.requirement.count({ where: { adminStatus: 'PENDING' } }),
      this.prisma.requirement.count({ where: { adminStatus: 'APPROVED' } }),
      this.prisma.requirement.count({ where: { adminStatus: 'REJECTED' } }),
      this.prisma.requirement.count({ where: { status: 'DRAFT' } }),
      this.prisma.requirement.count({ where: { status: 'OPEN' } }),
      this.prisma.requirement.count({ where: { status: 'CLOSED' } }),
      this.prisma.requirement.count({ 
        where: { 
          createdAt: { 
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          } 
        } 
      })
    ]);

    return {
      total: totalRequirements,
      pending: pendingRequirements,
      approved: approvedRequirements,
      rejected: rejectedRequirements,
      draft: draftRequirements,
      open: openRequirements,
      closed: closedRequirements,
      recent: recentRequirements
    };
  }

  private mapToResponseDto(requirement: any): RequirementResponseDto {
    return {
      id: requirement.id,
      userId: requirement.userId,
      userType: requirement.userType,
      title: requirement.title,
      shortDescription: requirement.shortDescription,
      description: requirement.detailedDescription,
      additionalNotes: requirement.additionalNotes,
      categoryId: requirement.categoryId,
      subcategoryId: requirement.subcategoryId,
      productId: requirement.productId,
      brandId: requirement.brandId,
      quantity: requirement.quantity,
      unitPrice: requirement.unitPrice,
      postingType: requirement.postingType,
      negotiableType: requirement.negotiableType,
      negotiationWindow: requirement.negotiationWindow,
      urgency: requirement.urgency || 'MEDIUM',
      status: requirement.status,
      adminStatus: requirement.adminStatus,
      approvedBy: requirement.approvedBy,
      approvedAt: requirement.approvedAt,
      rejectedBy: requirement.rejectedBy,
      rejectedAt: requirement.rejectedAt,
      rejectionReason: requirement.rejectionReason,
      deliveryMethod: requirement.deliveryMethod || 'STANDARD',
      deliveryTimeline: requirement.deliveryTimeline || 'FLEXIBLE',
      country: requirement.country || 'India',
      city: requirement.city,
      state: requirement.state,
      technicalSpecs: requirement.technicalSpecs,
      images: requirement.photos || [],
      visibility: requirement.visibility,
      visibilityType: requirement.visibilityType,
      visibleEmails: requirement.visibleEmails || [],
      visibleState: requirement.visibleState,
      visibleCity: requirement.visibleCity,
      quotesCount: requirement.quotesCount || 0,
      deadline: requirement.deadline,
      postedAt: requirement.postedAt || requirement.createdAt,
      createdAt: requirement.createdAt,
      updatedAt: requirement.updatedAt,
      category: requirement.category,
      subcategory: requirement.subcategory,
      product: requirement.product,
      brand: requirement.brand,
      user: requirement.user
    };
  }
}
