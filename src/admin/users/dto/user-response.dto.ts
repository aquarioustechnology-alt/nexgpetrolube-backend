import { ApiProperty } from '@nestjs/swagger';
import { UserRole, KycStatus } from '@prisma/client';

export class AdminUserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'First name', required: false })
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  lastName?: string;

  @ApiProperty({ description: 'Company name' })
  companyName: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'KYC status', enum: KycStatus })
  kycStatus: KycStatus;

  @ApiProperty({ description: 'Whether the user is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Whether the email is verified' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Whether the phone is verified' })
  isPhoneVerified: boolean;

  @ApiProperty({ description: 'Profile image URL', required: false })
  profileImage?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'User addresses', required: false })
  addresses?: {
    id: string;
    type: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isDefault: boolean;
  }[];

  @ApiProperty({ description: 'KYC information', required: false })
  kyc?: {
    id: string;
    gstNumber?: string;
    panNumber?: string;
    aadhaarNumber?: string;
    kycStatus: KycStatus;
    submittedAt: Date;
    reviewedAt?: Date;
  };

  @ApiProperty({ description: 'KYC documents count', required: false })
  kycDocumentsCount?: number;
}
