import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'Unique identifier of the product', example: 'clx0123456789abcdefghijk' })
  id: string;

  @ApiProperty({ description: 'Name of the product', example: 'Shell Helix Ultra 5W-30' })
  name: string;

  @ApiPropertyOptional({ description: 'Description of the product', example: 'Fully synthetic engine oil for high-performance engines' })
  description?: string;

  @ApiPropertyOptional({ description: 'Key features in rich text format', example: '<p>Advanced synthetic formula</p>' })
  keyFeatures?: string;

  @ApiPropertyOptional({ description: 'Product specifications as JSON', example: { viscosity: '5W-30', capacity: '4L' } })
  specifications?: any;

  @ApiPropertyOptional({ description: 'Array of image URLs', example: ['uploads/product1.jpg', 'uploads/product2.jpg'] })
  images?: string[];

  @ApiProperty({ description: 'Category ID', example: 'clx0123456789abcdefghijk' })
  categoryId: string;

  @ApiPropertyOptional({ description: 'Subcategory ID', example: 'clx0123456789abcdefghijk' })
  subcategoryId?: string;

  @ApiPropertyOptional({ description: 'Brand ID', example: 'clx0123456789abcdefghijk' })
  brandId?: string;

  @ApiProperty({ description: 'Whether the product is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Timestamp when the product was created', example: '2023-10-27T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the product was last updated', example: '2023-10-27T10:30:00.000Z' })
  updatedAt: Date;

  // Related data
  @ApiPropertyOptional({ description: 'Category name', example: 'Engine Oils' })
  categoryName?: string;

  @ApiPropertyOptional({ description: 'Subcategory name', example: 'Synthetic' })
  subcategoryName?: string;

  @ApiPropertyOptional({ description: 'Brand name', example: 'Shell' })
  brandName?: string;
}
