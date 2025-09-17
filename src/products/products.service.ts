import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.listing.findMany({
      include: {
        user: true,
        category: true,
        subcategory: true,
        brand: true,
        unit: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.listing.findUnique({
      where: { id },
      include: {
        user: true,
        category: true,
        subcategory: true,
        brand: true,
        unit: true,
      },
    });
  }
}
