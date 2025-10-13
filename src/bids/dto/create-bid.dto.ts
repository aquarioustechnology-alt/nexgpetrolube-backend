import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BidStatus, OfferPriority } from '@prisma/client';

export class CreateBidDto {
  @ApiProperty({ description: 'Requirement ID to bid on' })
  @IsString()
  requirementId: string;

  @ApiProperty({ description: 'Bid amount (unit price)' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ description: 'Required quantity' })
  @IsString()
  quantity: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Negotiation window in hours', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  negotiationWindow?: number;

  @ApiProperty({ description: 'Bid deadline', required: false })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({ description: 'Minimum quantity', required: false })
  @IsOptional()
  @IsString()
  minimumQuantity?: string;

  @ApiProperty({ description: 'Maximum quantity', required: false })
  @IsOptional()
  @IsString()
  maximumQuantity?: string;

  @ApiProperty({ description: 'Delivery terms', required: false })
  @IsOptional()
  @IsString()
  deliveryTerms?: string;

  @ApiProperty({ description: 'Payment terms', required: false })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiProperty({ description: 'Validity period in days', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  validityPeriod?: number;

  @ApiProperty({ description: 'Bid priority', required: false })
  @IsOptional()
  @IsEnum(OfferPriority)
  offerPriority?: OfferPriority;
}

export class BidResponseDto {
  @ApiProperty({ description: 'Bid ID' })
  id: string;

  @ApiProperty({ description: 'Requirement ID' })
  requirementId: string;

  @ApiProperty({ description: 'User ID who placed the bid' })
  userId: string;

  @ApiProperty({ description: 'Bid amount (unit price)' })
  amount: number;

  @ApiProperty({ description: 'Required quantity' })
  quantity: string;

  @ApiProperty({ description: 'Bid status' })
  status: BidStatus;

  @ApiProperty({ description: 'Whether this is the winning bid' })
  isWinning: boolean;

  @ApiProperty({ description: 'Additional notes' })
  notes?: string;

  @ApiProperty({ description: 'When the bid was placed' })
  placedAt: Date;

  @ApiProperty({ description: 'Negotiation window in hours' })
  negotiationWindow?: number;

  @ApiProperty({ description: 'Bid deadline' })
  deadline?: Date;

  @ApiProperty({ description: 'Minimum quantity' })
  minimumQuantity?: string;

  @ApiProperty({ description: 'Maximum quantity' })
  maximumQuantity?: string;

  @ApiProperty({ description: 'Delivery terms' })
  deliveryTerms?: string;

  @ApiProperty({ description: 'Payment terms' })
  paymentTerms?: string;

  @ApiProperty({ description: 'Validity period in days' })
  validityPeriod?: number;

  @ApiProperty({ description: 'Bid priority' })
  offerPriority?: OfferPriority;

  @ApiProperty({ description: 'User details' })
  user: {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
  };

  @ApiProperty({ description: 'Requirement details' })
  requirement: {
    id: string;
    title: string;
    postingType: string;
  };
}
