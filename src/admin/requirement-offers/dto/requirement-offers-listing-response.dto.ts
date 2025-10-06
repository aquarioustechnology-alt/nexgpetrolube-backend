import { ApiProperty } from '@nestjs/swagger';
import { OfferResponseDto } from '../../../offers/dto/offer-response.dto';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
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

export class RequirementOffersListingResponseDto {
  @ApiProperty({ 
    description: 'Array of requirement offers',
    type: [OfferResponseDto]
  })
  data: OfferResponseDto[];

  @ApiProperty({ 
    description: 'Pagination metadata',
    type: PaginationMetaDto
  })
  pagination: PaginationMetaDto;
}

