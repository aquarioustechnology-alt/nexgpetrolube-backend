import { IsOptional, IsString, IsEnum, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RequirementOffersListingDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term for offer message, requirement details, or user info' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by offer status',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN', 'COUNTERED']
  })
  @IsOptional()
  @IsEnum(['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN', 'COUNTERED'])
  offerStatus?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by requirement owner type',
    enum: ['BUYER', 'SELLER', 'BOTH']
  })
  @IsOptional()
  @IsEnum(['BUYER', 'SELLER', 'BOTH'])
  requirementOwnerType?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by posting type',
    enum: ['REQUIREMENT', 'REVERSE_BIDDING', 'STANDARD_BIDDING']
  })
  @IsOptional()
  @IsEnum(['REQUIREMENT', 'REVERSE_BIDDING', 'STANDARD_BIDDING'])
  postingType?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by negotiable type',
    enum: ['negotiable', 'non-negotiable']
  })
  @IsOptional()
  @IsEnum(['negotiable', 'non-negotiable'])
  negotiableType?: string;

  @ApiPropertyOptional({ description: 'Filter by counter offer status' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isCounterOffer?: boolean;

  @ApiPropertyOptional({ description: 'Filter by requirement ID' })
  @IsOptional()
  @IsString()
  requirementId?: string;

  @ApiPropertyOptional({ description: 'Filter by offer user ID' })
  @IsOptional()
  @IsString()
  offerUserId?: string;

  @ApiPropertyOptional({ description: 'Filter by requirement owner ID' })
  @IsOptional()
  @IsString()
  requirementOwnerId?: string;

  @ApiPropertyOptional({ 
    description: 'Sort by field',
    enum: ['createdAt', 'updatedAt', 'offeredUnitPrice', 'offerStatus'],
    default: 'createdAt'
  })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'offeredUnitPrice', 'offerStatus'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

