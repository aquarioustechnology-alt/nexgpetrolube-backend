import { ApiProperty } from '@nestjs/swagger';

export class CountsResponseDto {
  @ApiProperty({ 
    description: 'Number of parent categories', 
    example: 5 
  })
  categories: number;

  @ApiProperty({ 
    description: 'Number of subcategories', 
    example: 15 
  })
  subcategories: number;

  @ApiProperty({ 
    description: 'Number of brands', 
    example: 8 
  })
  brands: number;

  @ApiProperty({ 
    description: 'Number of products', 
    example: 120 
  })
  products: number;
}
