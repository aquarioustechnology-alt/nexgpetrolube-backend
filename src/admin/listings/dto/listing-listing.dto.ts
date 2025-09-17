import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListingListingDto {
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

  @ApiPropertyOptional({ description: 'Search term for product name, company name, category' })
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

  @ApiPropertyOptional({ description: 'Filter by listing status', enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by subcategory' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({ description: 'Filter by user role', enum: ['BUYER', 'SELLER', 'BOTH'] })
  @IsOptional()
  @IsEnum(['BUYER', 'SELLER', 'BOTH'])
  role?: 'BUYER' | 'SELLER' | 'BOTH';

  @ApiPropertyOptional({ description: 'Filter by active status (true/false)' })
  @IsOptional()
  @IsBooleanString()
  isActive?: boolean;
}

export class ListingSubmissionResponseDto {
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

  @ApiProperty()
  productName: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  category: string;

  @ApiPropertyOptional()
  subcategory?: string;

  @ApiPropertyOptional()
  brand?: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  pricePerUnit: number;

  @ApiPropertyOptional()
  minimumOrderQuantity?: number;

  @ApiPropertyOptional()
  maximumOrderQuantity?: number;

  @ApiProperty({ enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE'] })
  status: string;

  @ApiProperty()
  submittedAt: Date;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiPropertyOptional()
  approvedBy?: string;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  images?: string[];
}

export class PaginatedListingResponseDto {
  @ApiProperty({ type: [ListingSubmissionResponseDto] })
  data: ListingSubmissionResponseDto[];

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
