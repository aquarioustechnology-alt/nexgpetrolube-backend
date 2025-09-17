import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuctionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.auction.findMany({
      include: {
        listing: true,
        requirement: true,
        bids: true,
      },
    });
  }
}
