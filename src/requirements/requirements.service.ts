import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { RequirementResponseDto } from './dto/requirement-response.dto';
import { PostingType, RequirementStatus } from './dto/create-requirement.dto';
import { RequirementStatus as PrismaRequirementStatus } from '@prisma/client';

@Injectable()
export class RequirementsService {
  constructor(private prisma: PrismaService) {}

  async create(createRequirementDto: CreateRequirementDto, userId: string): Promise<RequirementResponseDto> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    // Validate category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createRequirementDto.categoryId }
    });
    if (!category) {
      throw new BadRequestException('Invalid category ID');
    }

    // Validate subcategory if provided
    if (createRequirementDto.subcategoryId) {
      const subcategory = await this.prisma.category.findUnique({
        where: { 
          id: createRequirementDto.subcategoryId,
          parentId: { not: null } // Ensure it's actually a subcategory
        }
      });
      if (!subcategory) {
        throw new BadRequestException('Invalid subcategory ID');
      }
      
      // Verify the subcategory belongs to the selected category
      if (subcategory.parentId !== createRequirementDto.categoryId) {
        throw new BadRequestException('Subcategory does not belong to the selected category');
      }
    }

    // Validate product if productId is provided
    if (createRequirementDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: createRequirementDto.productId }
      });
      if (!product) {
        throw new BadRequestException('Invalid product ID');
      }
    }

    // Validate that either productId or productName is provided
    if (!createRequirementDto.productId && !createRequirementDto.productName) {
      throw new BadRequestException('Either productId or productName must be provided');
    }

    // Brand validation is not needed since we're using brandName directly


    // Create the requirement
    const requirementData: any = {
      userId,
      userType: createRequirementDto.userType,
      title: createRequirementDto.title,
      description: createRequirementDto.description,
      shortDescription: createRequirementDto.shortDescription,
      additionalNotes: createRequirementDto.additionalNotes,
      categoryId: createRequirementDto.categoryId,
      subcategoryId: createRequirementDto.subcategoryId,
      productId: createRequirementDto.productId,
      productName: createRequirementDto.productName,
      brandName: createRequirementDto.brandName,
      quantity: createRequirementDto.quantity,
      units: createRequirementDto.units,
      unitPrice: createRequirementDto.unitPrice,
      postingType: createRequirementDto.postingType,
      negotiableType: createRequirementDto.negotiableType,
      negotiationWindow: createRequirementDto.negotiationWindow,
      urgency: createRequirementDto.urgency,
      status: createRequirementDto.status as PrismaRequirementStatus,
      adminStatus: createRequirementDto.adminStatus as PrismaRequirementStatus,
      deliveryMethod: createRequirementDto.deliveryMethod,
      deliveryTimeline: createRequirementDto.deliveryTimeline,
      country: createRequirementDto.country,
      city: createRequirementDto.city,
      state: createRequirementDto.state,
      technicalSpecs: createRequirementDto.technicalSpecs,
      images: createRequirementDto.images || [],
      visibility: createRequirementDto.visibility,
      visibilityType: createRequirementDto.visibilityType,
      visibleEmails: createRequirementDto.visibleEmails || [],
      visibleState: createRequirementDto.visibleState,
      visibleCity: createRequirementDto.visibleCity,
      deadline: createRequirementDto.deadline ? new Date(createRequirementDto.deadline) : null,
    };

    const requirement = await this.prisma.requirement.create({
      data: requirementData,
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
            companyName: true,
            email: true
          }
        }
      }
    });

    return this.mapToResponseDto(requirement);
  }

  async findAll(page: number = 1, limit: number = 10, status?: PrismaRequirementStatus): Promise<{ data: RequirementResponseDto[], total: number, page: number, limit: number }> {
    const skip = (page - 1) * limit;
    
    const where = status ? { status } : {};
    
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
              companyName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.requirement.count({ where })
    ]);

    return {
      data: requirements.map(req => this.mapToResponseDto(req)),
      total,
      page,
      limit
    };
  }

  async findOne(id: string): Promise<RequirementResponseDto> {
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
            companyName: true,
            email: true
          }
        }
      }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    return this.mapToResponseDto(requirement);
  }

  async findByUser(userId: string, page: number = 1, limit: number = 10): Promise<{ data: RequirementResponseDto[], total: number, page: number, limit: number }> {
    const skip = (page - 1) * limit;
    
    const [requirements, total] = await Promise.all([
      this.prisma.requirement.findMany({
        where: { userId },
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
              companyName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.requirement.count({ where: { userId } })
    ]);

    return {
      data: requirements.map(req => this.mapToResponseDto(req)),
      total,
      page,
      limit
    };
  }

  async update(id: string, updateRequirementDto: UpdateRequirementDto, userId: string): Promise<RequirementResponseDto> {
    const existingRequirement = await this.prisma.requirement.findUnique({
      where: { id }
    });

    if (!existingRequirement) {
      throw new NotFoundException('Requirement not found');
    }

    if (existingRequirement.userId !== userId) {
      throw new BadRequestException('You can only update your own requirements');
    }

    const updateData: any = { ...updateRequirementDto };
    if (updateRequirementDto.deadline) {
      updateData.deadline = new Date(updateRequirementDto.deadline);
    }
    
    const requirement = await this.prisma.requirement.update({
      where: { id },
      data: updateData,
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
            companyName: true,
            email: true
          }
        }
      }
    });

    return this.mapToResponseDto(requirement);
  }

  async remove(id: string, userId: string): Promise<void> {
    const existingRequirement = await this.prisma.requirement.findUnique({
      where: { id }
    });

    if (!existingRequirement) {
      throw new NotFoundException('Requirement not found');
    }

    if (existingRequirement.userId !== userId) {
      throw new BadRequestException('You can only delete your own requirements');
    }

    await this.prisma.requirement.delete({
      where: { id }
    });
  }

  // Dropdown APIs
  async getCategories() {
    return this.prisma.category.findMany({
      where: { 
        isActive: true,
        parentId: null // Only fetch top-level categories (without parentId)
      },
      select: {
        id: true,
        name: true,
        description: true,
        sortOrder: true
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async getSubcategories(categoryId: string) {
    return this.prisma.category.findMany({
      where: {
        parentId: categoryId, // Subcategories with this parent ID
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });
  }

  async getProducts(categoryId: string, subcategoryId?: string) {
    const whereClause: any = {
      categoryId: categoryId,
      isActive: true
    };

    // If subcategoryId is provided, filter by both categoryId and subcategoryId
    if (subcategoryId) {
      whereClause.subcategoryId = subcategoryId;
    }

    return this.prisma.product.findMany({
      where: whereClause,
      include: {
        brand: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async getBrands() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true
      },
      orderBy: { name: 'asc' }
    });
  }



  async getProductSpecifications(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        specifications: true
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      productId: product.id,
      productName: product.name,
      specifications: product.specifications
    };
  }

  async approveRequirement(id: string, adminId?: string): Promise<RequirementResponseDto> {
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
            companyName: true,
            email: true
          }
        }
      }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    const updatedRequirement = await this.prisma.requirement.update({
      where: { id },
      data: {
        adminStatus: 'APPROVED' as any,
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null
      } as any,
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
            companyName: true,
            email: true
          }
        }
      }
    });

    return this.mapToResponseDto(updatedRequirement);
  }

  async rejectRequirement(id: string, rejectionReason: string, adminId?: string): Promise<RequirementResponseDto> {
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
            companyName: true,
            email: true
          }
        }
      }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    const updatedRequirement = await this.prisma.requirement.update({
      where: { id },
      data: {
        adminStatus: 'REJECTED' as any,
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason,
        approvedBy: null,
        approvedAt: null
      } as any,
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
            companyName: true,
            email: true
          }
        }
      }
    });

    return this.mapToResponseDto(updatedRequirement);
  }

  private mapToResponseDto(requirement: any): RequirementResponseDto {
    return {
      id: requirement.id,
      userId: requirement.userId,
      userType: requirement.userType,
      title: requirement.title,
      description: requirement.description,
      shortDescription: requirement.shortDescription,
      additionalNotes: requirement.additionalNotes,
      categoryId: requirement.categoryId,
      subcategoryId: requirement.subcategoryId,
      productId: requirement.productId,
      productName: requirement.productName,
      brandName: requirement.brandName,
      quantity: requirement.quantity,
      units: requirement.units,
      unitPrice: requirement.unitPrice,
      postingType: requirement.postingType,
      negotiableType: requirement.negotiableType,
      negotiationWindow: requirement.negotiationWindow,
      urgency: requirement.urgency,
      status: requirement.status,
      adminStatus: requirement.adminStatus,
      approvedBy: requirement.approvedBy,
      approvedAt: requirement.approvedAt,
      rejectedBy: requirement.rejectedBy,
      rejectedAt: requirement.rejectedAt,
      rejectionReason: requirement.rejectionReason,
      deliveryMethod: requirement.deliveryMethod,
      deliveryTimeline: requirement.deliveryTimeline,
      country: requirement.country,
      city: requirement.city,
      state: requirement.state,
      technicalSpecs: requirement.technicalSpecs,
      images: requirement.images,
      visibility: requirement.visibility,
      visibilityType: requirement.visibilityType,
      visibleEmails: requirement.visibleEmails,
      visibleState: requirement.visibleState,
      visibleCity: requirement.visibleCity,
      quotesCount: requirement.quotesCount,
      deadline: requirement.deadline,
      postedAt: requirement.postedAt,
      createdAt: requirement.createdAt,
      updatedAt: requirement.updatedAt,
      category: requirement.category,
      subcategory: requirement.subcategory,
      product: requirement.product,
      brand: requirement.brand,
      user: requirement.user
    };
  }

  async getDashboardListing(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 10,
    status?: PrismaRequirementStatus,
    postingType?: string,
    search?: string,
    userType?: string
  ) {
    const skip = (page - 1) * limit;
    
    // Build where clause based on user role and userType parameter
    let whereClause: any = {};
    
    // Always filter by userId for security
    whereClause.userId = userId;
    
    // Use userType parameter if provided, otherwise fall back to userRole
    if (userType) {
      whereClause.userType = userType;
    } else {
      // Fallback to role-based filtering
      if (userRole === 'SELLER') {
        whereClause.userType = 'SELLER';
      } else if (userRole === 'BUYER') {
        whereClause.userType = 'BUYER';
      } else if (userRole === 'BOTH') {
        whereClause.userType = { in: ['SELLER', 'BUYER'] };
      } else {
        // Admin or other roles see all requirements
        delete whereClause.userType;
      }
    }

    // Add status filter
    if (status) {
      whereClause.status = status;
    }

    // Add posting type filter
    if (postingType) {
      whereClause.postingType = postingType;
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [requirements, total] = await Promise.all([
      this.prisma.requirement.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
              role: true
            }
          }
        }
      }),
      this.prisma.requirement.count({ where: whereClause })
    ]);

    return {
      requirements: requirements.map(req => this.mapToResponseDto(req)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getDashboardDetails(id: string, userId: string, userRole: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
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
            name: true,
            specifications: true
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
            role: true
          }
        }
      }
    });

    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }

    // Check if user has access to this requirement - only check userId ownership
    if (userRole === 'SELLER' || userRole === 'BUYER' || userRole === 'BOTH') {
      if (requirement.userId !== userId) {
        throw new NotFoundException('Requirement not found');
      }
    }

    return this.mapToResponseDto(requirement);
  }

  async getPublicListing(params: {
    page: number;
    limit: number;
    search?: string;
    userType?: string;
    postingType?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
    minPrice?: number;
    maxPrice?: number;
    state?: string;
    city?: string;
  }) {
    const { page, limit, search, userType, postingType, category, sortBy, sortOrder, minPrice, maxPrice, state, city } = params;
    const skip = (page - 1) * limit;
    
    // Build where clause for public listing
    let whereClause: any = {
      // Only show approved and open requirements publicly
      adminStatus: 'APPROVED',
      status: 'OPEN' // Always show only open requirements
    };
    
    // Add user type filter
    if (userType) {
      whereClause.userType = userType;
    }
    
    // Add posting type filter
    if (postingType) {
      whereClause.postingType = postingType;
    }
    
    // Add category filter
    if (category) {
      whereClause.category = {
        name: { contains: category, mode: 'insensitive' }
      };
    }
    
    // Add price range filter - ensure unitPrice is not null
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.unitPrice = {
        not: null
      };
    }
    
    // Add location filters
    if (state) {
      whereClause.state = {
        contains: state,
        mode: 'insensitive'
      };
    }
    
    if (city) {
      whereClause.city = {
        contains: city,
        mode: 'insensitive'
      };
    }
    
    // Add search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
        { brandName: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { subcategory: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    // Build order by clause
    let orderBy: any = {};
    if (sortBy && sortOrder) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy = { createdAt: 'desc' }; // Default sort
    }
    
    // Handle price filtering separately since unitPrice is stored as string
    let requirements, total;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      // For price filtering, we need to fetch more data and filter in application layer
      const allRequirements = await this.prisma.requirement.findMany({
        where: whereClause,
        orderBy,
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
              role: true
            }
          }
        }
      });
      
      // Filter by price range in application layer
      const filteredRequirements = allRequirements.filter(req => {
        if (!req.unitPrice) return false;
        const price = parseFloat(req.unitPrice);
        if (isNaN(price)) return false;
        
        if (minPrice !== undefined && price < minPrice) return false;
        if (maxPrice !== undefined && price > maxPrice) return false;
        
        return true;
      });
      
      // Apply pagination to filtered results
      total = filteredRequirements.length;
      requirements = filteredRequirements.slice(skip, skip + limit);
    } else {
      // Normal query without price filtering
      [requirements, total] = await Promise.all([
        this.prisma.requirement.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy,
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
                role: true
              }
            }
          }
        }),
        this.prisma.requirement.count({ where: whereClause })
      ]);
    }
    
    return {
      requirements: requirements.map(req => this.mapToResponseDto(req)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      filters: {
        search: search || null,
        userType: userType || null,
        postingType: postingType || null,
        status: 'OPEN', // Always OPEN for public API
        category: category || null,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc'
      }
    };
  }

}
