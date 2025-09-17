import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.quote.findMany({
      include: {
        user: true,
        requirement: true,
      },
    });
  }
}
