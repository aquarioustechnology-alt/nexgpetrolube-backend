import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the category',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the category',
    example: 'Engine Oils',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the category',
    example: 'High-quality engine oils for various vehicle types',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID for hierarchical categories',
    example: 'clx1234567890',
  })
  parentId?: string;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Sort order for display',
    example: 0,
  })
  sortOrder: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Number of subcategories',
    example: 5,
  })
  subcategoriesCount?: number;

  @ApiPropertyOptional({
    description: 'Number of products in this category',
    example: 25,
  })
  productsCount?: number;

  @ApiPropertyOptional({
    description: 'Parent category details',
    type: 'object',
  })
  parent?: Partial<CategoryResponseDto>;

  @ApiPropertyOptional({
    description: 'Child categories',
    type: [CategoryResponseDto],
  })
  children?: CategoryResponseDto[];
}
