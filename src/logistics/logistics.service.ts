import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateLogisticsDto } from './dto/create-logistics.dto';
import { LogisticsResponseDto } from './dto/logistics-response.dto';
import { LogisticsStatus } from '@prisma/client';

@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}

  async createLogistics(createLogisticsDto: CreateLogisticsDto, userId: string): Promise<LogisticsResponseDto> {
    // Check if offer exists
    const offer = await this.prisma.offer.findUnique({
      where: { id: createLogisticsDto.offerId },
      include: {
        requirement: true,
        requirementOwner: true,
        offerUser: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Check if logistics already exists for this offer
    const existingLogistics = await this.prisma.logistics.findFirst({
      where: { offerId: createLogisticsDto.offerId },
    });

    if (existingLogistics) {
      throw new BadRequestException('Logistics already exists for this offer');
    }

    // Create logistics entry with all fields
    const logistics = await this.prisma.logistics.create({
      data: {
        offerId: createLogisticsDto.offerId,
        userId,
        driverPhone: createLogisticsDto.driverPhone,
        truckNumber: createLogisticsDto.truckNumber,
        logisticsCompany: createLogisticsDto.logisticsCompany,
        estimatedDeliveryDate: new Date(createLogisticsDto.estimatedDeliveryDate),
        // New fields - using type assertion to bypass TypeScript cache issue
        ...(createLogisticsDto.invoiceCopy && { invoiceCopy: createLogisticsDto.invoiceCopy }),
        ...(createLogisticsDto.biltyCopy && { biltyCopy: createLogisticsDto.biltyCopy }),
        ...(createLogisticsDto.insurance !== undefined && { insurance: createLogisticsDto.insurance }),
        ...(createLogisticsDto.notes && { notes: createLogisticsDto.notes }),
        ...(createLogisticsDto.trackingId && { trackingId: createLogisticsDto.trackingId }),
        status: LogisticsStatus.PENDING,
      } as any,
      include: {
        offer: {
          include: {
            requirement: true,
            requirementOwner: true,
            offerUser: true,
          },
        },
        user: true,
      },
    });

    return this.mapToLogisticsResponse(logistics);
  }

  async getLogisticsByOfferId(offerId: string): Promise<LogisticsResponseDto | null> {
    const logistics = await this.prisma.logistics.findFirst({
      where: { offerId },
      include: {
        offer: {
          include: {
            requirement: true,
            requirementOwner: true,
            offerUser: true,
          },
        },
        user: true,
      },
    });

    if (!logistics) {
      return null;
    }

    return this.mapToLogisticsResponse(logistics);
  }

  async updateLogisticsStatus(logisticsId: string, status: LogisticsStatus): Promise<LogisticsResponseDto> {
    const logistics = await this.prisma.logistics.findUnique({
      where: { id: logisticsId },
    });

    if (!logistics) {
      throw new NotFoundException('Logistics not found');
    }

    const updatedLogistics = await this.prisma.logistics.update({
      where: { id: logisticsId },
      data: { 
        status,
        ...(status === LogisticsStatus.IN_TRANSIT && !logistics.actualPickupDate && {
          actualPickupDate: new Date(),
        }),
        ...(status === LogisticsStatus.DELIVERED && !logistics.actualDeliveryDate && {
          actualDeliveryDate: new Date(),
        }),
      },
      include: {
        offer: {
          include: {
            requirement: true,
            requirementOwner: true,
            offerUser: true,
          },
        },
        user: true,
      },
    });

    return this.mapToLogisticsResponse(updatedLogistics);
  }

  private mapToLogisticsResponse(logistics: any): LogisticsResponseDto {
    return {
      id: logistics.id,
      offerId: logistics.offerId,
      userId: logistics.userId,
      driverName: logistics.driverName,
      driverPhone: logistics.driverPhone,
      truckNumber: logistics.truckNumber,
      truckType: logistics.truckType,
      logisticsCompany: logistics.logisticsCompany,
      companyPhone: logistics.companyPhone,
      companyEmail: logistics.companyEmail,
      pickupAddress: logistics.pickupAddress,
      deliveryAddress: logistics.deliveryAddress,
      estimatedPickupDate: logistics.estimatedPickupDate,
      estimatedDeliveryDate: logistics.estimatedDeliveryDate,
      actualPickupDate: logistics.actualPickupDate,
      actualDeliveryDate: logistics.actualDeliveryDate,
      status: logistics.status,
      notes: logistics.notes,
      trackingNumber: logistics.trackingNumber,
      // New fields
      invoiceCopy: logistics.invoiceCopy,
      biltyCopy: logistics.biltyCopy,
      insurance: logistics.insurance,
      trackingId: logistics.trackingId,
      createdAt: logistics.createdAt,
      updatedAt: logistics.updatedAt,
    };
  }
}
