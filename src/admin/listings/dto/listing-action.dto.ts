import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class ListingApproveDto {
  @ApiProperty({
    description: 'Listing ID to approve',
    example: 'listing_123456789',
  })
  @IsString()
  @IsNotEmpty()
  listingId: string;

  @ApiPropertyOptional({
    description: 'Optional approval notes',
    example: 'Listing approved after verification',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Approval notes must not exceed 500 characters' })
  notes?: string;
}

export class ListingRejectDto {
  @ApiProperty({
    description: 'Listing ID to reject',
    example: 'listing_123456789',
  })
  @IsString()
  @IsNotEmpty()
  listingId: string;

  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Product information incomplete or unclear',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Rejection reason must not exceed 500 characters' })
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional rejection notes',
    example: 'Please provide clearer product images and specifications',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Rejection notes must not exceed 500 characters' })
  notes?: string;
}

export class ListingActionResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  listingId: string;

  @ApiProperty()
  newStatus: string;

  @ApiProperty()
  reviewedAt: string;

  @ApiPropertyOptional()
  reviewedBy?: string;
}
