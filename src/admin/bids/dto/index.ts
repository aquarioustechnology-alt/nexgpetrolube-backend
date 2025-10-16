import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum BidStatus {
  ACTIVE = 'active',
  WON = 'won',
  LOST = 'lost',
  OUTBID = 'outbid',
}

export enum PostingType {
  REVERSE_BIDDING = 'REVERSE_BIDDING',
  STANDARD_BIDDING = 'STANDARD_BIDDING',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class AdminBidsListingDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search in bid details, requirement title, or user info' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: BidStatus, description: 'Filter by bid status' })
  @IsOptional()
  @IsEnum(BidStatus)
  status?: BidStatus;

  @ApiPropertyOptional({ enum: PostingType, description: 'Filter by posting type' })
  @IsOptional()
  @IsEnum(PostingType)
  postingType?: PostingType;

  @ApiPropertyOptional({ description: 'Filter by requirement ID' })
  @IsOptional()
  @IsString()
  requirementId?: string;

  @ApiPropertyOptional({ description: 'Filter by bidder user ID' })
  @IsOptional()
  @IsString()
  bidderId?: string;

  @ApiPropertyOptional({ description: 'Filter by requirement owner ID' })
  @IsOptional()
  @IsString()
  requirementOwnerId?: string;

  @ApiPropertyOptional({ 
    enum: ['createdAt', 'updatedAt', 'offeredUnitPrice', 'bidStatus'], 
    description: 'Sort by field (default: createdAt)' 
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: SortOrder, description: 'Sort order (default: desc)' })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class AdminBidStatsDto {
  @ApiProperty({ description: 'Total number of bids' })
  total: number;

  @ApiProperty({ description: 'Number of active bids' })
  active: number;

  @ApiProperty({ description: 'Number of won bids' })
  won: number;

  @ApiProperty({ description: 'Number of lost bids' })
  lost: number;

  @ApiProperty({ description: 'Number of outbid bids' })
  outbid: number;
}

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
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
}

export class AdminBidResponseDto {
  @ApiProperty({ description: 'Bid ID' })
  id: string;

  @ApiProperty({ description: 'Requirement ID' })
  requirementId: string;

  @ApiProperty({ description: 'Bidder user ID' })
  userId: string;

  @ApiProperty({ description: 'Bid amount' })
  amount: number;

  @ApiProperty({ description: 'Bid quantity' })
  quantity: number;

  @ApiProperty({ description: 'Bid status' })
  status: string;

  @ApiProperty({ description: 'Whether this is the winning bid' })
  isWinning: boolean;

  @ApiPropertyOptional({ description: 'Bid notes' })
  notes?: string;

  @ApiProperty({ description: 'When the bid was placed' })
  placedAt: string;

  @ApiPropertyOptional({ description: 'Negotiation window' })
  negotiationWindow?: number;

  @ApiPropertyOptional({ description: 'Deadline' })
  deadline?: string;

  @ApiPropertyOptional({ description: 'Minimum quantity' })
  minimumQuantity?: number;

  @ApiPropertyOptional({ description: 'Maximum quantity' })
  maximumQuantity?: number;

  @ApiPropertyOptional({ description: 'Delivery terms' })
  deliveryTerms?: string;

  @ApiPropertyOptional({ description: 'Payment terms' })
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Validity period' })
  validityPeriod?: number;

  @ApiPropertyOptional({ description: 'Offer priority' })
  offerPriority?: string;

  @ApiPropertyOptional({ description: 'Seller payment status' })
  sellerPaymentStatus?: string;

  @ApiPropertyOptional({ description: 'Buyer payment status' })
  buyerPaymentStatus?: string;

  @ApiPropertyOptional({ description: 'Allocated quantity' })
  allocatedQuantity?: number;

  @ApiPropertyOptional({ description: 'Allocated percentage' })
  allocatedPercentage?: number;

  @ApiPropertyOptional({ description: 'Original price' })
  originalPrice?: number;

  @ApiPropertyOptional({ description: 'Original quantity' })
  originalQuantity?: number;

  @ApiProperty({ description: 'Bidder information' })
  user: {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
    email: string;
    phone?: string;
  };

  @ApiProperty({ description: 'Requirement information' })
  requirement: {
    id: string;
    title: string;
    description?: string;
    postingType: string;
    productName?: string;
    units?: string;
    quantity?: string;
    unitPrice?: string;
    status?: string;
    urgency?: string;
    deliveryMethod?: string;
    deliveryTimeline?: string;
    country?: string;
    city?: string;
    state?: string;
    createdAt?: string;
    updatedAt?: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      companyName: string;
      email?: string;
      phone?: string;
    };
    category?: {
      id: string;
      name: string;
    };
    subcategory?: {
      id: string;
      name: string;
    };
    product?: {
      id: string;
      name: string;
      description?: string;
    };
    brand?: {
      id: string;
      name: string;
    };
  };

  @ApiPropertyOptional({ description: 'Payment information', type: 'array' })
  payments?: Array<{
    id: string;
    amount: number;
    paymentType: string;
    paymentStatus: string;
    paymentMethod?: string;
    transactionId?: string;
    processedAt?: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      companyName: string;
      email: string;
    };
  }>;

  @ApiPropertyOptional({ description: 'Logistics information', type: 'array' })
  logistics?: Array<{
    id: string;
    trackingNumber?: string;
    logisticsCompany?: string;
    deliveryAddress?: string;
    actualDeliveryDate?: string;
    status?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      companyName: string;
      email: string;
    };
  }>;
}

export class AdminBidsListingResponseDto {
  @ApiProperty({ type: [AdminBidResponseDto], description: 'List of bids' })
  data: AdminBidResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  pagination: PaginationMetaDto;
}

export class RejectBidDto {
  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  reason: string;
}
