import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class KycApproveDto {
  @ApiProperty({
    description: 'KYC submission ID to approve',
    example: 'kyc_123456789',
  })
  @IsString()
  @IsNotEmpty()
  kycId: string;

  @ApiPropertyOptional({
    description: 'Optional approval notes',
    example: 'All documents verified successfully',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Approval notes must not exceed 500 characters' })
  notes?: string;
}

export class KycRejectDto {
  @ApiProperty({
    description: 'KYC submission ID to reject',
    example: 'kyc_123456789',
  })
  @IsString()
  @IsNotEmpty()
  kycId: string;

  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Documents are not clear or incomplete',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Rejection reason must not exceed 500 characters' })
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional rejection notes',
    example: 'Please resubmit with clearer documents',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Rejection notes must not exceed 500 characters' })
  notes?: string;
}

export class KycActionResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  kycId: string;

  @ApiProperty()
  newStatus: string;

  @ApiProperty()
  reviewedAt: string;

  @ApiPropertyOptional()
  reviewedBy?: string;
}
