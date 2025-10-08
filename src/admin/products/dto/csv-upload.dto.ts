import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CsvUploadResponseDto {
  @ApiProperty({ description: 'Number of products successfully created', example: 10 })
  successCount: number;

  @ApiProperty({ description: 'Number of products that failed to create', example: 2 })
  errorCount: number;

  @ApiProperty({ description: 'List of errors encountered', example: ['Product "Test Oil" already exists', 'Category "Invalid Category" not found'] })
  errors: string[];

  @ApiProperty({ description: 'List of successfully created products', example: ['HYDRAULIC OIL 22', 'HYDRAULIC OIL 32'] })
  createdProducts: string[];
}

export class CsvProductDto {
  @ApiProperty({ description: 'Name of the product', example: 'HYDRAULIC OIL 22' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the product' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Key features in rich text format' })
  @IsOptional()
  @IsString()
  keyFeatures?: string;

  @ApiProperty({ description: 'Category name', example: 'LUBRICANTS' })
  @IsString()
  categoryName: string;

  @ApiProperty({ description: 'Subcategory name', example: 'HYDRAULIC OIL' })
  @IsString()
  subcategoryName: string;

  @ApiPropertyOptional({ description: 'Brand name', example: 'PREMIUM' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional({ description: 'Whether the product is active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Product specifications as key-value pairs' })
  @IsOptional()
  specifications?: Record<string, any>;
}
