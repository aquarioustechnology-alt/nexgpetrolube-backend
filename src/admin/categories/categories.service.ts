import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryListingDto } from './dto/category-listing.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class AdminCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Check if category name already exists
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: createCategoryDto.name,
        parentId: createCategoryDto.parentId || null,
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists in the same parent level');
    }

    // If parentId is provided, verify parent exists
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        description: createCategoryDto.description,
        parentId: createCategoryDto.parentId,
        isActive: createCategoryDto.isActive ?? true,
        sortOrder: createCategoryDto.sortOrder ?? 0,
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            children: true,
            products: true,
            requirements: true,
          },
        },
      },
    });

    return this.mapToResponseDto(category);
  }

  async findAll(query: CategoryListingDto) {
    const {
      search,
      isActive,
      parentId,
      page = 1,
      limit = 10,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (parentId !== undefined) {
      if (parentId === 'not-null') {
        where.parentId = { not: null };
      } else if (parentId === 'null') {
        where.parentId = null;
      } else {
        where.parentId = parentId;
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              children: true,
              products: true,
              requirements: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories.map(category => this.mapToResponseDto(category)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            children: true,
            products: true,
            requirements: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.mapToResponseDto(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    // Check if category exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // If name is being updated, check for conflicts
    if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
      const conflictingCategory = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          parentId: updateCategoryDto.parentId ?? existingCategory.parentId,
          id: { not: id },
        },
      });

      if (conflictingCategory) {
        throw new ConflictException('Category with this name already exists in the same parent level');
      }
    }

    // If parentId is being updated, verify parent exists
    if (updateCategoryDto.parentId && updateCategoryDto.parentId !== existingCategory.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      // Prevent circular reference
      if (updateCategoryDto.parentId === id) {
        throw new ConflictException('Category cannot be its own parent');
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            children: true,
            products: true,
            requirements: true,
          },
        },
      },
    });

    return this.mapToResponseDto(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true,
        requirements: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has children
    if (category.children.length > 0) {
      throw new ConflictException('Cannot delete category with child categories');
    }

    // Check if category has products
    if (category.products.length > 0) {
      throw new ConflictException('Cannot delete category with associated products');
    }

    // Check if category has requirements
    if (category.requirements.length > 0) {
      throw new ConflictException('Cannot delete category with associated requirements');
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }

  async getHierarchy(): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        parentId: null, // Only root categories
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
            },
            _count: {
              select: {
                children: true,
                products: true,
                requirements: true,
              },
            },
          },
        },
        _count: {
          select: {
            children: true,
            products: true,
            requirements: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map(category => this.mapToResponseDto(category));
  }

  private mapToResponseDto(category: any): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      childrenCount: category._count?.children || 0,
      productsCount: category._count?.products || 0,
      requirementsCount: category._count?.requirements || 0,
      parent: category.parent ? this.mapToResponseDto(category.parent) : undefined,
      children: category.children?.map((child: any) => this.mapToResponseDto(child)) || [],
    };
  }
}
