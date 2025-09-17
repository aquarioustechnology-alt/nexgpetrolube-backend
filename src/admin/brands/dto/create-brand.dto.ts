import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsUrl } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ description: 'Name of the brand', example: 'Shell' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the brand', example: 'Global energy company' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Brand logo filename', example: 'shell-logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;


  @ApiPropertyOptional({ description: 'Whether the brand is active', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}
