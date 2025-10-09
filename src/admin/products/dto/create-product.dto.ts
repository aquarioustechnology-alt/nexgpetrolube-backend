import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Name of the product', example: 'Shell Helix Ultra 5W-30' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the product', example: 'Fully synthetic engine oil for high-performance engines' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Key features in rich text format', example: '<p>Advanced synthetic formula</p><ul><li>Superior engine protection</li><li>Extended drain intervals</li></ul>' })
  @IsOptional()
  @IsString()
  keyFeatures?: string;

  @ApiPropertyOptional({ description: 'Product specifications as JSON', example: { viscosity: '5W-30', capacity: '4L', type: 'Synthetic' } })
  @IsOptional()
  specifications?: any;

  @ApiPropertyOptional({ description: 'Array of image URLs', example: ['uploads/product1.jpg', 'uploads/product2.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'Category ID', example: 'clx0123456789abcdefghijk' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Subcategory ID', example: 'clx0123456789abcdefghijk' })
  @IsOptional()
  @IsString()
  subcategoryId?: string;

  @ApiPropertyOptional({ description: 'Brand ID', example: 'clx0123456789abcdefghijk' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Whether the product is active', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
