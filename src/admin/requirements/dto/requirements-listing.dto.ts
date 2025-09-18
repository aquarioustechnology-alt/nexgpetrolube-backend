import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum RequirementStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  OPEN = 'OPEN',
  QUOTED = 'QUOTED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum AdminStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PostingType {
  REQUIREMENT = 'REQUIREMENT',
  REVERSE_BIDDING = 'REVERSE_BIDDING',
  STANDARD_BIDDING = 'STANDARD_BIDDING'
}

export class RequirementsListingDto {
  @ApiProperty({ 
    description: 'Page number for pagination',
    required: false,
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Number of items per page',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ 
    description: 'Search term for title, description, or user information',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: 'Filter by requirement status',
    required: false,
    enum: RequirementStatus
  })
  @IsOptional()
  @IsEnum(RequirementStatus)
  status?: RequirementStatus;

  @ApiProperty({ 
    description: 'Filter by admin approval status',
    required: false,
    enum: AdminStatus
  })
  @IsOptional()
  @IsEnum(AdminStatus)
  adminStatus?: AdminStatus;

  @ApiProperty({ 
    description: 'Filter by posting type',
    required: false,
    enum: PostingType
  })
  @IsOptional()
  @IsEnum(PostingType)
  postingType?: PostingType;

  @ApiProperty({ 
    description: 'Filter by category ID',
    required: false
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ 
    description: 'Filter by subcategory ID',
    required: false
  })
  @IsOptional()
  @IsString()
  subcategoryId?: string;

  @ApiProperty({ 
    description: 'Filter by user type',
    required: false,
    enum: ['BUYER', 'SELLER', 'BOTH']
  })
  @IsOptional()
  @IsEnum(['BUYER', 'SELLER', 'BOTH'])
  userType?: 'BUYER' | 'SELLER' | 'BOTH';

  @ApiProperty({ 
    description: 'Sort by field',
    required: false,
    enum: ['createdAt', 'updatedAt', 'title', 'status', 'adminStatus']
  })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'title', 'status', 'adminStatus'])
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'status' | 'adminStatus' = 'createdAt';

  @ApiProperty({ 
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
