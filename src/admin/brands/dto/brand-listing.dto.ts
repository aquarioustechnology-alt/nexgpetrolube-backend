import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum BrandSortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  SORT_ORDER = 'sortOrder',
}

export class BrandListingDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search term for brand name or description', example: 'shell' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: BrandSortBy, description: 'Field to sort by', example: BrandSortBy.NAME })
  @IsOptional()
  @IsEnum(BrandSortBy)
  sortBy?: BrandSortBy;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Sort order', example: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
