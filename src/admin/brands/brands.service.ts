import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandListingDto } from './dto/brand-listing.dto';
import { BrandResponseDto } from './dto/brand-response.dto';

@Injectable()
export class AdminBrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
    // Check if brand name already exists
    const existingBrand = await this.prisma.brand.findFirst({
      where: {
        name: createBrandDto.name,
      },
    });

    if (existingBrand) {
      throw new ConflictException('Brand with this name already exists');
    }

    const brand = await this.prisma.brand.create({
      data: {
        name: createBrandDto.name,
        description: createBrandDto.description,
        logo: createBrandDto.logo,
        isActive: createBrandDto.isActive ?? true,
      },
    });

    return this.mapToResponseDto(brand);
  }

  async findAll(query: BrandListingDto) {
    const {
      search,
      isActive,
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

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [brands, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.brand.count({ where }),
    ]);

    return {
      data: brands.map(brand => this.mapToResponseDto(brand)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<BrandResponseDto> {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return this.mapToResponseDto(brand);
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<BrandResponseDto> {
    // Check if brand exists
    const existingBrand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      throw new NotFoundException('Brand not found');
    }

    // If name is being updated, check for conflicts
    if (updateBrandDto.name && updateBrandDto.name !== existingBrand.name) {
      const conflictingBrand = await this.prisma.brand.findFirst({
        where: {
          name: updateBrandDto.name,
          id: { not: id },
        },
      });

      if (conflictingBrand) {
        throw new ConflictException('Brand with this name already exists');
      }
    }

    const brand = await this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
    });

    return this.mapToResponseDto(brand);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    await this.prisma.brand.delete({
      where: { id },
    });
  }

  private mapToResponseDto(brand: any): BrandResponseDto {
    return {
      id: brand.id,
      name: brand.name,
      description: brand.description,
      logo: brand.logo,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }
}
