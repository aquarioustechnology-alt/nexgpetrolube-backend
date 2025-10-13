import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { KycSubmissionDto } from './dto/kyc-submission.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: createUserDto,
      include: {
        addresses: true,
        kyc: true,
        bankDetails: true,
      },
    });

    return this.mapToResponseDto(user);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, role?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          addresses: true,
          kyc: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(user => this.mapToResponseDto(user)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        kyc: {
          include: {
            documents: true,
          },
        },
        bankDetails: true,
        requirements: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToResponseDto(user);
  }

  async getUserDetails(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        kyc: {
          include: {
            documents: true,
          },
        },
        bankDetails: true,
        requirements: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Determine KYC status based on business logic
    let kycStatus = 'NOT_SUBMITTED';
    let kycRejectionReason = null;

    if (user.kyc) {
      // If KYC record exists, use its status
      kycStatus = user.kyc.kycStatus;
      kycRejectionReason = user.kyc.rejectionReason;
    } else if (user.kycStatus && user.kycStatus !== 'NOT_SUBMITTED') {
      // If no KYC record but user has a status, use user's status
      kycStatus = user.kycStatus;
    }

    const userResponse = this.mapToResponseDto(user);
    userResponse.kycStatus = kycStatus as any;
    userResponse.kycRejectionReason = kycRejectionReason;

    return userResponse;
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        addresses: true,
        kyc: true,
        bankDetails: true,
      },
    });

    return user ? this.mapToResponseDto(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        addresses: true,
        kyc: true,
        bankDetails: true,
      },
    });

    return this.mapToResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateKycStatus(id: string, status: string, reason?: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        kyc: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { kycStatus: status as any },
      include: {
        addresses: true,
        kyc: true,
        bankDetails: true,
      },
    });

    // Update KYC record if exists
    if (user.kyc) {
      await this.prisma.kyc.update({
        where: { userId: id },
        data: {
          kycStatus: status as any,
          rejectionReason: reason,
          reviewedAt: new Date(),
        },
      });
    }

    return this.mapToResponseDto(updatedUser);
  }

  async submitKyc(userId: string, kycData: KycSubmissionDto): Promise<UserResponseDto> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kyc: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if KYC already exists
    if (user.kyc) {
      throw new BadRequestException('KYC already submitted for this user');
    }

    // Update user KYC status
    await this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING' },
    });

    // Create KYC record
    const kycRecord = await this.prisma.kyc.create({
      data: {
        userId: userId,
        panNumber: kycData.panNumber,
        aadhaarNumber: kycData.aadhaarNumber,
        gstNumber: kycData.gstNumber,
        kycStatus: 'PENDING',
      },
    });

    // Create communication address
    await this.prisma.address.create({
      data: {
        userId: userId,
        type: 'communication',
        line1: kycData.address.line1,
        line2: kycData.address.line2,
        city: kycData.address.city,
        state: kycData.address.state,
        country: kycData.address.country || 'India',
        pincode: kycData.address.pincode,
        isDefault: true,
      },
    });

    // Create delivery address if provided
    if (kycData.deliveryAddress) {
      await this.prisma.address.create({
        data: {
          userId: userId,
          type: 'delivery',
          line1: kycData.deliveryAddress.line1,
          line2: kycData.deliveryAddress.line2,
          city: kycData.deliveryAddress.city,
          state: kycData.deliveryAddress.state,
          country: kycData.deliveryAddress.country || 'India',
          pincode: kycData.deliveryAddress.pincode,
          isDefault: false,
        },
      });
    }

    // Create KYC documents if uploadedFiles is provided
    if (kycData.uploadedFiles) {
      const documentTypes = [
        { key: 'authorizationLetter', type: 'authorization-letter' },
        { key: 'panDocument', type: 'pan-card' },
        { key: 'aadhaarDocument', type: 'aadhaar-card' },
        { key: 'gstCertificate', type: 'gst-certificate' },
        { key: 'companyRegistration', type: 'company-registration' },
        { key: 'bankStatement', type: 'bank-statement' },
        { key: 'addressProof', type: 'address-proof' },
      ];

      for (const doc of documentTypes) {
        if (kycData.uploadedFiles[doc.key as keyof typeof kycData.uploadedFiles]) {
          await this.prisma.kycDocument.create({
            data: {
              kycId: kycRecord.id,
              type: doc.type,
              fileName: kycData.uploadedFiles[doc.key as keyof typeof kycData.uploadedFiles]!,
              fileUrl: `/uploads/${kycData.uploadedFiles[doc.key as keyof typeof kycData.uploadedFiles]!}`,
              fileSize: 0, // Will be updated when file is processed
              mimeType: 'application/octet-stream', // Will be updated when file is processed
            },
          });
        }
      }

      // Update user profile image if provided
      if (kycData.uploadedFiles.profilePicture) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            profileImage: `/uploads/${kycData.uploadedFiles.profilePicture}`,
          },
        });
      }
    }

    // Return updated user details
    return this.getUserDetails(userId);
  }

  async getStats() {
    const [
      totalUsers,
      buyers,
      sellers,
      both,
      kycPending,
      kycApproved,
      kycRejected,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'BUYER' } }),
      this.prisma.user.count({ where: { role: 'SELLER' } }),
      this.prisma.user.count({ where: { role: 'BOTH' } }),
      this.prisma.user.count({ where: { kycStatus: 'PENDING' } }),
      this.prisma.user.count({ where: { kycStatus: 'APPROVED' } }),
      this.prisma.user.count({ where: { kycStatus: 'REJECTED' } }),
    ]);

    return {
      totalUsers,
      byRole: {
        buyers,
        sellers,
        both,
      },
      byKycStatus: {
        pending: kycPending,
        approved: kycApproved,
        rejected: kycRejected,
      },
    };
  }


  private mapToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      role: user.role,
      kycStatus: user.kycStatus,
      kycRejectionReason: user.kyc?.rejectionReason || null,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      addresses: user.addresses || [],
      kyc: user.kyc,
      bankDetails: user.bankDetails,
      listings: user.listings || [],
      requirements: user.requirements || [],
    };
  }
}
