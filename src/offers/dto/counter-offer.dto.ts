import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDecimal, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum CounterOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export class CreateCounterOfferDto {
  @ApiProperty({ description: 'ID of the original offer', example: 'cm123456789' })
  @IsString()
  offerId: string;

  @ApiProperty({ description: 'Counteroffer price per unit', example: 150.50 })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.01)
  offeredPrice: number;

  @ApiProperty({ description: 'Counteroffer quantity', example: '1000 Liters' })
  @IsString()
  offeredQuantity: string;
}

export class UpdateCounterOfferDto {
  @ApiPropertyOptional({ description: 'Counteroffer price per unit', example: 150.50 })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0.01)
  offeredPrice?: number;

  @ApiPropertyOptional({ description: 'Counteroffer quantity', example: '1000 Liters' })
  @IsOptional()
  @IsString()
  offeredQuantity?: string;
}

export class CounterOfferResponseDto {
  @ApiProperty({ description: 'Counteroffer ID', example: 'cm123456789' })
  id: string;

  @ApiProperty({ description: 'ID of the original offer', example: 'cm123456789' })
  offerId: string;

  @ApiProperty({ description: 'ID of the user who made the counteroffer', example: 'cm123456789' })
  fromId: string;

  @ApiProperty({ description: 'Requirement ID', example: 'cm123456789' })
  requirementId: string;

  @ApiProperty({ description: 'Counteroffer number (1-5)', example: 1 })
  counterofferNumber: number;

  @ApiProperty({ description: 'Counteroffer price per unit', example: 150.50 })
  offeredPrice: number;

  @ApiProperty({ description: 'Counteroffer quantity', example: '1000 Liters' })
  offeredQuantity: string;

  @ApiProperty({ description: 'Counteroffer status', enum: CounterOfferStatus, example: CounterOfferStatus.PENDING })
  status: CounterOfferStatus;

  @ApiProperty({ description: 'Negotiation window in hours', example: 24 })
  negotiationWindowHours: number;

  @ApiProperty({ description: 'Expiration date', example: '2024-01-15T10:30:00Z' })
  expiresAt: Date;

  @ApiProperty({ description: 'Creation date', example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date', example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'User who made the counteroffer' })
  fromUser?: {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
    email: string;
  };

  @ApiPropertyOptional({ description: 'Original offer details' })
  offer?: {
    id: string;
    offeredUnitPrice: number;
    offeredQuantity: string;
    offerStatus: string;
  };

  @ApiPropertyOptional({ description: 'Requirement details' })
  requirement?: {
    id: string;
    title: string;
    negotiableType: string;
    negotiationWindow: string;
  };
}

export class AcceptCounterOfferDto {
  @ApiProperty({ description: 'Counteroffer ID to accept', example: 'cm123456789' })
  @IsString()
  counterOfferId: string;
}

export class RejectCounterOfferDto {
  @ApiProperty({ description: 'Counteroffer ID to reject', example: 'cm123456789' })
  @IsString()
  counterOfferId: string;

  @ApiPropertyOptional({ description: 'Reason for rejection', example: 'Price too low' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CounterOfferListResponseDto {
  @ApiProperty({ description: 'List of counteroffers', type: [CounterOfferResponseDto] })
  counterOffers: CounterOfferResponseDto[];

  @ApiProperty({ description: 'Total count of counteroffers', example: 5 })
  totalCount: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;
}
