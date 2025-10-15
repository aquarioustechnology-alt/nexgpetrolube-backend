import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNotEmpty, Matches, IsOptional, IsBoolean } from 'class-validator';

export class CreateLogisticsDto {
  @ApiProperty({ description: 'Offer ID', required: false })
  @IsString()
  @IsOptional()
  offerId?: string;

  @ApiProperty({ description: 'Bid ID', required: false })
  @IsString()
  @IsOptional()
  bidId?: string;

  @ApiProperty({ description: 'Driver Phone Number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, { message: 'Driver phone must be a valid 10-digit Indian phone number' })
  driverPhone: string;

  @ApiProperty({ description: 'Truck Number' })
  @IsString()
  @IsNotEmpty()
  truckNumber: string;

  @ApiProperty({ description: 'Logistics Company Name' })
  @IsString()
  @IsNotEmpty()
  logisticsCompany: string;

  @ApiProperty({ description: 'Estimated Delivery Date' })
  @IsDateString()
  @IsNotEmpty()
  estimatedDeliveryDate: string;

  // New optional fields
  @ApiProperty({ description: 'Invoice Copy File Path', required: false })
  @IsString()
  @IsOptional()
  invoiceCopy?: string;

  @ApiProperty({ description: 'Bilty Copy File Path', required: false })
  @IsString()
  @IsOptional()
  biltyCopy?: string;

  @ApiProperty({ description: 'Insurance Coverage', required: false })
  @IsBoolean()
  @IsOptional()
  insurance?: boolean;

  @ApiProperty({ description: 'Notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Tracking ID', required: false })
  @IsString()
  @IsOptional()
  trackingId?: string;
}
