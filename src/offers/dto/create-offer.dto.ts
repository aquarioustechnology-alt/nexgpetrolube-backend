import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OfferStatus, OfferPriority } from '@prisma/client';

export class CreateOfferDto {
  @IsString()
  requirementId: string;

  @IsString()
  offeredQuantity: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offeredUnitPrice?: number;

  @IsOptional()
  @IsString()
  offerMessage?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  negotiationWindow?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsDateString()
  offerExpiryDate?: string;

  @IsOptional()
  @IsString()
  minimumQuantity?: string;

  @IsOptional()
  @IsString()
  maximumQuantity?: string;

  @IsOptional()
  @IsString()
  deliveryTerms?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  validityPeriod?: number;

  @IsOptional()
  @IsEnum(OfferPriority)
  offerPriority?: OfferPriority;
}
