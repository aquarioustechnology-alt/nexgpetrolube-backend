import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';
import { KycStatus } from '@prisma/client';

export class KycListingDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term for company name, email, GST, PAN, Aadhaar' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by', default: 'submittedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'submittedAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Filter by KYC status', enum: KycStatus })
  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;

  @ApiPropertyOptional({ description: 'Filter by user role', enum: ['BUYER', 'SELLER', 'BOTH'] })
  @IsOptional()
  @IsEnum(['BUYER', 'SELLER', 'BOTH'])
  role?: 'BUYER' | 'SELLER' | 'BOTH';

  @ApiPropertyOptional({ description: 'Filter by active status (true/false)' })
  @IsOptional()
  @IsBooleanString()
  isActive?: boolean;
}

export class KycDocumentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  documentType: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  uploadedAt: Date;
}

export class KycSubmissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  firstName: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiProperty()
  role: string;

  @ApiPropertyOptional()
  gstNumber?: string;

  @ApiPropertyOptional()
  panNumber?: string;

  @ApiPropertyOptional()
  aadhaarNumber?: string;

  @ApiProperty({ enum: KycStatus })
  kycStatus: KycStatus;

  @ApiProperty()
  submittedAt: Date;

  @ApiPropertyOptional()
  reviewedAt?: Date;

  @ApiPropertyOptional()
  reviewedBy?: string;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [KycDocumentDto] })
  documents: KycDocumentDto[];

  @ApiPropertyOptional()
  communicationAddress?: {
    id: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };

  @ApiPropertyOptional()
  deliveryAddress?: {
    id: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
}

export class PaginatedKycResponseDto {
  @ApiProperty({ type: [KycSubmissionResponseDto] })
  data: KycSubmissionResponseDto[];

  @ApiProperty()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
