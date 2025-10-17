import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ProfileResponseDto, AddressDto, KycDto, KycDocumentDto, BankDetailDto } from './dto/profile-response.dto';
import { UpdatePersonalInfoDto, UpdateAddressDto, UpdateKycDto, UpdateBankDetailsDto } from './dto/profile-update.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        kyc: {
          include: {
            documents: true,
          },
        },
        bankDetails: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate profile completion percentage
    const profileCompletion = this.calculateProfileCompletion(user);

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
      dateOfBirth: (user as any).dateOfBirth,
      gender: (user as any).gender,
      accountType: (user as any).accountType,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      addresses: user.addresses.map(this.mapAddressToDto),
      kyc: user.kyc ? this.mapKycToDto(user.kyc) : undefined,
      bankDetails: user.bankDetails ? this.mapBankDetailToDto(user.bankDetails) : undefined,
      profileCompletion,
    };
  }

  async updatePersonalInfo(userId: string, updateData: UpdatePersonalInfoDto): Promise<ProfileResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Update user personal information
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.firstName !== undefined && { firstName: updateData.firstName }),
        ...(updateData.lastName !== undefined && { lastName: updateData.lastName }),
        ...(updateData.companyName !== undefined && { companyName: updateData.companyName }),
        ...(updateData.phone !== undefined && { phone: updateData.phone }),
        ...(updateData.profileImage !== undefined && { profileImage: updateData.profileImage }),
        ...(updateData.dateOfBirth !== undefined && { dateOfBirth: updateData.dateOfBirth }),
        ...(updateData.gender !== undefined && { gender: updateData.gender }),
        ...(updateData.accountType !== undefined && { accountType: updateData.accountType }),
        updatedAt: new Date(),
      },
    });

    return this.getProfile(userId);
  }

  async updateAddress(userId: string, addressId: string, updateData: UpdateAddressDto): Promise<ProfileResponseDto> {
    // Check if address exists and belongs to user
    const existingAddress = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userId,
      },
    });

    if (!existingAddress) {
      throw new NotFoundException('Address not found');
    }

    // Update address
    await this.prisma.address.update({
      where: { id: addressId },
      data: {
        ...(updateData.type !== undefined && { type: updateData.type }),
        ...(updateData.line1 !== undefined && { line1: updateData.line1 }),
        ...(updateData.line2 !== undefined && { line2: updateData.line2 }),
        ...(updateData.city !== undefined && { city: updateData.city }),
        ...(updateData.state !== undefined && { state: updateData.state }),
        ...(updateData.country !== undefined && { country: updateData.country }),
        ...(updateData.pincode !== undefined && { pincode: updateData.pincode }),
        ...(updateData.isDefault !== undefined && { isDefault: updateData.isDefault }),
        updatedAt: new Date(),
      },
    });

    return this.getProfile(userId);
  }

  async addAddress(userId: string, addressData: UpdateAddressDto): Promise<ProfileResponseDto> {
    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new address
    await this.prisma.address.create({
      data: {
        userId,
        type: addressData.type || 'personal',
        line1: addressData.line1 || '',
        line2: addressData.line2,
        city: addressData.city || '',
        state: addressData.state || '',
        country: addressData.country || 'India',
        pincode: addressData.pincode || '',
        isDefault: addressData.isDefault || false,
      },
    });

    return this.getProfile(userId);
  }

  async deleteAddress(userId: string, addressId: string): Promise<ProfileResponseDto> {
    // Check if address exists and belongs to user
    const existingAddress = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userId,
      },
    });

    if (!existingAddress) {
      throw new NotFoundException('Address not found');
    }

    // Delete address
    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return this.getProfile(userId);
  }

  async updateKyc(userId: string, kycData: UpdateKycDto): Promise<ProfileResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if KYC exists
    const existingKyc = await this.prisma.kyc.findUnique({
      where: { userId },
    });

    if (existingKyc) {
      // Update existing KYC
      await this.prisma.kyc.update({
        where: { userId },
        data: {
          ...(kycData.panNumber !== undefined && { panNumber: kycData.panNumber }),
          ...(kycData.aadhaarNumber !== undefined && { aadhaarNumber: kycData.aadhaarNumber }),
          ...(kycData.gstNumber !== undefined && { gstNumber: kycData.gstNumber }),
          ...(kycData.yearsInBusiness !== undefined && { yearsInBusiness: kycData.yearsInBusiness }),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new KYC
      await this.prisma.kyc.create({
        data: {
          userId,
          panNumber: kycData.panNumber,
          aadhaarNumber: kycData.aadhaarNumber,
          gstNumber: kycData.gstNumber,
          yearsInBusiness: kycData.yearsInBusiness,
          kycStatus: 'PENDING',
        },
      });
    }

    return this.getProfile(userId);
  }

  async updateBankDetails(userId: string, bankData: UpdateBankDetailsDto): Promise<ProfileResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if bank details exist
    const existingBankDetails = await this.prisma.bankDetail.findUnique({
      where: { userId },
    });

    if (existingBankDetails) {
      // Update existing bank details
      await this.prisma.bankDetail.update({
        where: { userId },
        data: {
          ...(bankData.accountNumber !== undefined && { accountNumber: bankData.accountNumber }),
          ...(bankData.ifscCode !== undefined && { ifscCode: bankData.ifscCode }),
          ...(bankData.bankName !== undefined && { bankName: bankData.bankName }),
          ...(bankData.accountHolderName !== undefined && { accountHolderName: bankData.accountHolderName }),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new bank details
      await this.prisma.bankDetail.create({
        data: {
          userId,
          accountNumber: bankData.accountNumber || '',
          ifscCode: bankData.ifscCode || '',
          bankName: bankData.bankName || '',
          accountHolderName: bankData.accountHolderName || '',
        },
      });
    }

    return this.getProfile(userId);
  }

  private calculateProfileCompletion(user: any): number {
    const fields = [
      user.firstName,
      user.lastName,
      user.email,
      user.phone,
      user.companyName,
      user.profileImage,
      (user as any).dateOfBirth,
      (user as any).gender,
      (user as any).accountType,
    ];

    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  }

  private mapAddressToDto(address: any): AddressDto {
    return {
      id: address.id,
      type: address.type,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
      isDefault: address.isDefault,
    };
  }

  private mapKycToDto(kyc: any): KycDto {
    return {
      id: kyc.id,
      panNumber: kyc.panNumber,
      aadhaarNumber: kyc.aadhaarNumber,
      gstNumber: kyc.gstNumber,
      yearsInBusiness: kyc.yearsInBusiness,
      kycStatus: kyc.kycStatus,
      rejectionReason: kyc.rejectionReason,
      submittedAt: kyc.submittedAt.toISOString(),
      documents: kyc.documents.map((doc: any) => ({
        id: doc.id,
        type: doc.type,
        url: doc.fileUrl || doc.fileName || '', // Use fileUrl or fileName from the database
        name: doc.fileName || '', // Use fileName from the database
      })),
    };
  }

  private mapBankDetailToDto(bankDetail: any): BankDetailDto {
    return {
      id: bankDetail.id,
      accountNumber: bankDetail.accountNumber,
      ifscCode: bankDetail.ifscCode,
      bankName: bankDetail.bankName,
      accountHolderName: bankDetail.accountHolderName,
      isVerified: bankDetail.isVerified,
    };
  }
}
