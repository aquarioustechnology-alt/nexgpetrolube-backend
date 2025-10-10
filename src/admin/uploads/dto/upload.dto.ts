import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateUploadDto {
  @ApiProperty({ description: 'File description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'File tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateUploadDto {
  @ApiPropertyOptional({ description: 'File description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'File tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Is file active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UploadResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  path: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  uploadedBy: string;

  @ApiProperty()
  uploadedAt: Date;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UploadListResponseDto {
  @ApiProperty({ type: [UploadResponseDto] })
  uploads: UploadResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
