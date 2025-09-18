import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
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

  @ApiProperty({ description: 'User role', enum: ['BUYER', 'SELLER', 'BOTH'] })
  role: string;

  @ApiProperty({ description: 'KYC status', enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'] })
  kycStatus: string;

  @ApiProperty({ description: 'KYC rejection reason', required: false })
  kycRejectionReason?: string;

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
  addresses?: any[];

  @ApiProperty({ description: 'KYC information', required: false })
  kyc?: any;

  @ApiProperty({ description: 'Bank details', required: false })
  bankDetails?: any;

  @ApiProperty({ description: 'User listings', required: false })
  listings?: any[];

  @ApiProperty({ description: 'User requirements', required: false })
  requirements?: any[];
}
