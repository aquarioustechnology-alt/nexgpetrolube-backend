import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductListingDto } from './dto/product-listing.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductSortBy } from './dto/product-listing.dto';

@Injectable()
export class AdminProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    // Check if product name already exists
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        name: createProductDto.name,
      },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this name already exists');
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Verify subcategory exists if provided
    if (createProductDto.subcategoryId) {
      const subcategory = await this.prisma.category.findUnique({
        where: { 
          id: createProductDto.subcategoryId,
          parentId: { not: null } // Ensure it's actually a subcategory
        },
      });

      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }

      // Verify the subcategory belongs to the selected category
      if (subcategory.parentId !== createProductDto.categoryId) {
        throw new NotFoundException('Subcategory does not belong to the selected category');
      }
    }

    // Verify brand exists if provided
    if (createProductDto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: createProductDto.brandId },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        keyFeatures: createProductDto.keyFeatures,
        specifications: createProductDto.specifications,
        categoryId: createProductDto.categoryId,
        subcategoryId: createProductDto.subcategoryId,
        brandId: createProductDto.brandId,
        isActive: createProductDto.isActive ?? true,
      },
      include: {
        category: true,
        subcategory: true,
        brand: true,
      },
    });

    return this.mapToResponseDto(product);
  }

  async findAll(query: ProductListingDto) {
    const {
      search,
      isActive,
      categoryId,
      subcategoryId,
      brandId,
      page = 1,
      limit = 10,
      sortBy = ProductSortBy.NAME,
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

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          subcategory: true,
          brand: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map(product => this.mapToResponseDto(product)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        brand: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapToResponseDto(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    // Check if product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // If name is being updated, check for conflicts
    if (updateProductDto.name && updateProductDto.name !== existingProduct.name) {
      const conflictingProduct = await this.prisma.product.findFirst({
        where: {
          name: updateProductDto.name,
          id: { not: id },
        },
      });

      if (conflictingProduct) {
        throw new ConflictException('Product with this name already exists');
      }
    }

    // Verify category exists if being updated
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Verify subcategory exists if being updated
    if (updateProductDto.subcategoryId) {
      const subcategory = await this.prisma.category.findUnique({
        where: { 
          id: updateProductDto.subcategoryId,
          parentId: { not: null } // Ensure it's actually a subcategory
        },
      });

      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }

      // Verify the subcategory belongs to the selected category
      const categoryId = updateProductDto.categoryId || existingProduct.categoryId;
      if (subcategory.parentId !== categoryId) {
        throw new NotFoundException('Subcategory does not belong to the selected category');
      }
    }

    // Verify brand exists if being updated
    if (updateProductDto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: updateProductDto.brandId },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        subcategory: true,
        brand: true,
      },
    });

    return this.mapToResponseDto(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });
  }

  private mapToResponseDto(product: any): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      keyFeatures: product.keyFeatures,
      specifications: product.specifications,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      brandId: product.brandId,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryName: product.category?.name,
      subcategoryName: product.subcategory?.name,
      brandName: product.brand?.name,
    };
  }
}
