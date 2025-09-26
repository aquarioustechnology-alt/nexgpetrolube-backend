import { IsOptional, IsString, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { OfferStatus, UserRole, PostingType } from '@prisma/client';

export class GetOffersQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  requirementId?: string;

  @IsOptional()
  @IsString()
  offerUserId?: string;

  @IsOptional()
  @IsString()
  requirementOwnerId?: string;

  @IsOptional()
  @IsEnum(OfferStatus)
  offerStatus?: OfferStatus;

  @IsOptional()
  @IsEnum(UserRole)
  requirementOwnerType?: UserRole;

  @IsOptional()
  @IsEnum(PostingType)
  postingType?: PostingType;

  @IsOptional()
  @IsString()
  negotiableType?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isCounterOffer?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class GetOfferHistoryQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  offerId?: string;

  @IsOptional()
  @IsString()
  performedBy?: string;
}

export class GetOfferNotificationsQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRead?: boolean;
}
