import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { KycListingDto, PaginatedKycResponseDto, KycSubmissionResponseDto } from './dto/kyc-listing.dto';
import { KycApproveDto, KycRejectDto, KycActionResponseDto } from './dto/kyc-action.dto';

@Injectable()
export class KycService {
  constructor(private prisma: PrismaService) {}

  async getKycQueue(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [kycSubmissions, total] = await Promise.all([
      this.prisma.kyc.findMany({
        where: { kycStatus: 'PENDING' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
          documents: true,
        },
        orderBy: { submittedAt: 'asc' },
      }),
      this.prisma.kyc.count({ where: { kycStatus: 'PENDING' } }),
    ]);

    return {
      data: kycSubmissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getKycSubmissions(kycListingDto: KycListingDto): Promise<PaginatedKycResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
      kycStatus,
      role,
      isActive,
    } = kycListingDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (kycStatus) {
      where.kycStatus = kycStatus;
    }

    if (search) {
      where.OR = [
        { user: { companyName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { gstNumber: { contains: search, mode: 'insensitive' } },
        { panNumber: { contains: search, mode: 'insensitive' } },
        { aadhaarNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.user = { ...where.user, role };
    }

    if (typeof isActive === 'boolean') {
      where.user = { ...where.user, isActive };
    }

    // Execute queries in parallel
    const [kycSubmissions, total] = await Promise.all([
      this.prisma.kyc.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              companyName: true,
              phone: true,
              role: true,
              isActive: true,
              addresses: {
                where: { type: { in: ['company', 'delivery'] } },
              },
            },
          },
          documents: {
            orderBy: { uploadedAt: 'desc' },
          },
        },
      }),
      this.prisma.kyc.count({ where }),
    ]);

    // Transform to response DTOs
    const submissionResponses: KycSubmissionResponseDto[] = kycSubmissions.map(kyc => ({
      id: kyc.id,
      userId: kyc.userId,
      companyName: kyc.user.companyName,
      email: kyc.user.email,
      phone: kyc.user.phone || undefined,
      firstName: kyc.user.firstName || '',
      lastName: kyc.user.lastName || undefined,
      role: kyc.user.role,
      gstNumber: kyc.gstNumber || undefined,
      panNumber: kyc.panNumber || undefined,
      aadhaarNumber: kyc.aadhaarNumber || undefined,
      kycStatus: kyc.kycStatus,
      submittedAt: kyc.submittedAt,
      reviewedAt: kyc.reviewedAt || undefined,
      reviewedBy: kyc.reviewedBy || undefined,
      rejectionReason: kyc.rejectionReason || undefined,
      isActive: kyc.user.isActive,
      createdAt: kyc.createdAt,
      updatedAt: kyc.updatedAt,
      documents: kyc.documents.map(doc => ({
        id: doc.id,
        documentType: doc.type,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        uploadedAt: doc.uploadedAt,
      })),
      communicationAddress: kyc.user.addresses.find(addr => addr.type === 'company') ? {
        id: kyc.user.addresses.find(addr => addr.type === 'company')!.id,
        line1: kyc.user.addresses.find(addr => addr.type === 'company')!.line1,
        line2: kyc.user.addresses.find(addr => addr.type === 'company')!.line2,
        city: kyc.user.addresses.find(addr => addr.type === 'company')!.city,
        state: kyc.user.addresses.find(addr => addr.type === 'company')!.state,
        country: kyc.user.addresses.find(addr => addr.type === 'company')!.country,
        pincode: kyc.user.addresses.find(addr => addr.type === 'company')!.pincode,
      } : undefined,
      deliveryAddress: kyc.user.addresses.find(addr => addr.type === 'delivery') ? {
        id: kyc.user.addresses.find(addr => addr.type === 'delivery')!.id,
        line1: kyc.user.addresses.find(addr => addr.type === 'delivery')!.line1,
        line2: kyc.user.addresses.find(addr => addr.type === 'delivery')!.line2,
        city: kyc.user.addresses.find(addr => addr.type === 'delivery')!.city,
        state: kyc.user.addresses.find(addr => addr.type === 'delivery')!.state,
        country: kyc.user.addresses.find(addr => addr.type === 'delivery')!.country,
        pincode: kyc.user.addresses.find(addr => addr.type === 'delivery')!.pincode,
      } : undefined,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: submissionResponses,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async approveKyc(approveDto: KycApproveDto, adminId: string): Promise<KycActionResponseDto> {
    const { kycId, notes } = approveDto;

    // Check if KYC submission exists and is in pending status
    const kycSubmission = await this.prisma.kyc.findUnique({
      where: { id: kycId },
      include: {
        user: true,
      },
    });

    if (!kycSubmission) {
      throw new NotFoundException('KYC submission not found');
    }

    if (kycSubmission.kycStatus !== 'PENDING') {
      throw new BadRequestException('KYC submission is not in pending status');
    }

    // Update KYC status to approved
    const updatedKyc = await this.prisma.kyc.update({
      where: { id: kycId },
      data: {
        kycStatus: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        // approvalNotes: notes, // TODO: Add this field to Prisma schema
      },
    });

    // Update user's KYC status
    await this.prisma.user.update({
      where: { id: kycSubmission.userId },
      data: { kycStatus: 'APPROVED' },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'KYC_APPROVED',
        entity: 'KYC',
        entityId: kycId,
        // details: {
        //   kycId,
        //   previousStatus: 'PENDING',
        //   newStatus: 'APPROVED',
        //   notes,
        // }, // TODO: Add details field to Prisma schema
        ipAddress: '127.0.0.1', // TODO: Get from request
        userAgent: 'Admin Panel', // TODO: Get from request
      },
    });

    return {
      success: true,
      message: 'KYC submission approved successfully',
      kycId,
      newStatus: 'APPROVED',
      reviewedAt: updatedKyc.reviewedAt!.toISOString(),
      reviewedBy: adminId,
    };
  }

  /**
   * Reject a KYC submission
   */
  async rejectKyc(rejectDto: KycRejectDto, adminId: string): Promise<KycActionResponseDto> {
    const { kycId, reason, notes } = rejectDto;

    // Check if KYC submission exists and is in pending status
    const kycSubmission = await this.prisma.kyc.findUnique({
      where: { id: kycId },
      include: {
        user: true,
      },
    });

    if (!kycSubmission) {
      throw new NotFoundException('KYC submission not found');
    }

    if (kycSubmission.kycStatus !== 'PENDING') {
      throw new BadRequestException('KYC submission is not in pending status');
    }

    // Update KYC status to rejected
    const updatedKyc = await this.prisma.kyc.update({
      where: { id: kycId },
      data: {
        kycStatus: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        rejectionReason: reason,
        // rejectionNotes: notes, // TODO: Add this field to Prisma schema
      },
    });

    // Update user's KYC status
    await this.prisma.user.update({
      where: { id: kycSubmission.userId },
      data: { kycStatus: 'REJECTED' },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'KYC_REJECTED',
        entity: 'KYC',
        entityId: kycId,
        // details: {
        //   kycId,
        //   previousStatus: 'PENDING',
        //   newStatus: 'REJECTED',
        //   reason,
        //   notes,
        // }, // TODO: Add details field to Prisma schema
        ipAddress: '127.0.0.1', // TODO: Get from request
        userAgent: 'Admin Panel', // TODO: Get from request
      },
    });

    return {
      success: true,
      message: 'KYC submission rejected successfully',
      kycId,
      newStatus: 'REJECTED',
      reviewedAt: updatedKyc.reviewedAt!.toISOString(),
      reviewedBy: adminId,
    };
  }
}
