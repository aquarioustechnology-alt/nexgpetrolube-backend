import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { OfferPriority, OfferAction, OfferNotificationType } from '@prisma/client';

export class UpdateOfferStatusDto {
  @IsEnum(OfferAction)
  action: OfferAction;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CounterOfferDto {
  @IsString()
  offeredQuantity: string;

  @IsNumber()
  @Type(() => Number)
  offeredUnitPrice: number;

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
