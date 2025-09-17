import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
        listings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
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
