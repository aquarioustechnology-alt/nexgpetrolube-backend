import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNotEmpty, Matches } from 'class-validator';

export class CreateLogisticsDto {
  @ApiProperty({ description: 'Offer ID' })
  @IsString()
  @IsNotEmpty()
  offerId: string;

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
}
