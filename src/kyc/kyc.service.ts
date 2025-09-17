import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class KycService {
  constructor(private prisma: PrismaService) {}

  async submitKyc(userId: string, kycData: any) {
    // Check if user already has KYC
    const existingKyc = await this.prisma.kyc.findUnique({
      where: { userId },
    });

    if (existingKyc && existingKyc.kycStatus !== 'REJECTED') {
      throw new BadRequestException('KYC already submitted');
    }

    const kyc = await this.prisma.kyc.upsert({
      where: { userId },
      update: {
        ...kycData,
        kycStatus: 'PENDING',
        submittedAt: new Date(),
      },
      create: {
        userId,
        ...kycData,
        kycStatus: 'PENDING',
        submittedAt: new Date(),
      },
    });

    // Update user KYC status
    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING' },
    });

    return kyc;
  }

  async getKycStatus(userId: string) {
    const kyc = await this.prisma.kyc.findUnique({
      where: { userId },
      include: {
        documents: true,
      },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    return kyc;
  }

  async uploadDocument(kycId: string, documentData: any) {
    return this.prisma.kycDocument.create({
      data: {
        kycId,
        ...documentData,
      },
    });
  }
}
