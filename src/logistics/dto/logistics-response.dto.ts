import { ApiProperty } from '@nestjs/swagger';
import { LogisticsStatus } from '@prisma/client';

export class LogisticsResponseDto {
  @ApiProperty({ description: 'Logistics ID' })
  id: string;

  @ApiProperty({ description: 'Offer ID' })
  offerId: string;

  @ApiProperty({ description: 'User ID who created the logistics entry' })
  userId: string;

  @ApiProperty({ description: 'Driver name', required: false })
  driverName?: string;

  @ApiProperty({ description: 'Driver phone number', required: false })
  driverPhone?: string;

  @ApiProperty({ description: 'Truck number', required: false })
  truckNumber?: string;

  @ApiProperty({ description: 'Truck type', required: false })
  truckType?: string;

  @ApiProperty({ description: 'Logistics company name', required: false })
  logisticsCompany?: string;

  @ApiProperty({ description: 'Company phone number', required: false })
  companyPhone?: string;

  @ApiProperty({ description: 'Company email', required: false })
  companyEmail?: string;

  @ApiProperty({ description: 'Pickup address', required: false })
  pickupAddress?: string;

  @ApiProperty({ description: 'Delivery address', required: false })
  deliveryAddress?: string;

  @ApiProperty({ description: 'Estimated pickup date', required: false })
  estimatedPickupDate?: Date;

  @ApiProperty({ description: 'Estimated delivery date', required: false })
  estimatedDeliveryDate?: Date;

  @ApiProperty({ description: 'Actual pickup date', required: false })
  actualPickupDate?: Date;

  @ApiProperty({ description: 'Actual delivery date', required: false })
  actualDeliveryDate?: Date;

  @ApiProperty({ description: 'Logistics status', enum: LogisticsStatus })
  status: LogisticsStatus;

  @ApiProperty({ description: 'Additional notes', required: false })
  notes?: string;

  @ApiProperty({ description: 'Tracking number', required: false })
  trackingNumber?: string;

  // New fields
  @ApiProperty({ description: 'Invoice copy file path', required: false })
  invoiceCopy?: string;

  @ApiProperty({ description: 'Bilty copy file path', required: false })
  biltyCopy?: string;

  @ApiProperty({ description: 'Insurance coverage', required: false })
  insurance?: boolean;

  @ApiProperty({ description: 'Tracking ID', required: false })
  trackingId?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
