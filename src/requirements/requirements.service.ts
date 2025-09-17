import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RequirementsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.requirement.findMany({
      include: {
        user: true,
        category: true,
        subcategory: true,
        unit: true,
      },
    });
  }
}
