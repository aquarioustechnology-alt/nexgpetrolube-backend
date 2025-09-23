import { ApiProperty } from '@nestjs/swagger';
import { RequirementResponseDto } from './requirement-response.dto';

export class PaginationInfo {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}

export class FilterInfo {
  @ApiProperty({ required: false })
  search?: string;

  @ApiProperty({ required: false })
  userType?: string;

  @ApiProperty({ required: false })
  postingType?: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty()
  sortBy: string;

  @ApiProperty()
  sortOrder: string;
}

export class PublicListingResponseDto {
  @ApiProperty({ type: [RequirementResponseDto] })
  requirements: RequirementResponseDto[];

  @ApiProperty({ type: PaginationInfo })
  pagination: PaginationInfo;

  @ApiProperty({ type: FilterInfo })
  filters: FilterInfo;
}
