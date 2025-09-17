import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum ProductSortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class ProductListingDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search term for product name or description', example: 'shell helix' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by category ID', example: 'clx0123456789abcdefghijk' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by subcategory ID', example: 'clx0123456789abcdefghijk' })
  @IsOptional()
  @IsString()
  subcategoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by brand ID', example: 'clx0123456789abcdefghijk' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ enum: ProductSortBy, description: 'Field to sort by', example: ProductSortBy.NAME })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.NAME;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Sort order', example: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
