import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CountsResponseDto } from './dto/counts-response.dto';

@Injectable()
export class AdminCountsService {
  constructor(private prisma: PrismaService) {}

  async getMastersCounts(): Promise<CountsResponseDto> {
    const [categoriesCount, subcategoriesCount, brandsCount, productsCount] = await Promise.all([
      // Count parent categories only (parentId is null)
      this.prisma.category.count({
        where: { parentId: null }
      }),
      // Count subcategories only (parentId is not null)
      this.prisma.category.count({
        where: { parentId: { not: null } }
      }),
      // Count all brands
      this.prisma.brand.count(),
      // Count all products
      this.prisma.product.count()
    ]);

    return {
      categories: categoriesCount,
      subcategories: subcategoriesCount,
      brands: brandsCount,
      products: productsCount,
    };
  }
}
