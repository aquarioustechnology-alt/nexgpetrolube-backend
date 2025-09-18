import { ApiProperty } from '@nestjs/swagger';
import { RequirementResponseDto } from '../../../requirements/dto/requirement-response.dto';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPrev: boolean;
}

export class RequirementsListingResponseDto {
  @ApiProperty({ 
    description: 'Array of requirements',
    type: [RequirementResponseDto]
  })
  data: RequirementResponseDto[];

  @ApiProperty({ 
    description: 'Pagination metadata',
    type: PaginationMetaDto
  })
  pagination: PaginationMetaDto;
}
