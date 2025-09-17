import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { UserRole, KycStatus } from '@prisma/client';

export class UserDetailsResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User phone number', required: false })
  phone?: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name', required: false })
  lastName?: string;

  @ApiProperty({ description: 'Company name', required: false })
  companyName?: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'KYC status', enum: KycStatus })
  kycStatus: KycStatus;

  @ApiProperty({ description: 'Whether user is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Whether email is verified' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Whether phone is verified' })
  isPhoneVerified: boolean;

  @ApiProperty({ description: 'Profile image URL', required: false })
  profileImage?: string;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: string;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: string;
}

export class UpdateUserDetailsDto {
  @ApiProperty({ description: 'User first name', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'User last name', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Company name', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Profile image URL', required: false })
  @IsOptional()
  @IsString()
  profileImage?: string;
}
