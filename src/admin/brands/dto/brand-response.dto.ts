import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BrandResponseDto {
  @ApiProperty({ description: 'Unique identifier of the brand', example: 'clx0123456789abcdefghijk' })
  id: string;

  @ApiProperty({ description: 'Name of the brand', example: 'Shell' })
  name: string;

  @ApiPropertyOptional({ description: 'Description of the brand', example: 'Global energy company' })
  description?: string;

  @ApiPropertyOptional({ description: 'Brand logo filename', example: 'shell-logo.png' })
  logo?: string;


  @ApiProperty({ description: 'Whether the brand is active', example: true })
  isActive: boolean;


  @ApiProperty({ description: 'Timestamp when the brand was created', example: '2023-10-27T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the brand was last updated', example: '2023-10-27T10:30:00.000Z' })
  updatedAt: Date;
}
