import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bid.findMany({
      include: {
        user: true,
        auction: true,
      },
    });
  }
}
