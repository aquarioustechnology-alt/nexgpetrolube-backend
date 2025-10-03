import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createPayment(createPaymentDto: CreatePaymentDto, userId: string) {
    const { offerId, paymentType, amount, paymentMethod, utrNumber, paymentScreenshot, notes } = createPaymentDto;

    // Verify offer exists and is in correct status
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        requirement: true,
        offerUser: true,
        requirementOwner: true,
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.offerStatus !== 'ACCEPTED') {
      throw new BadRequestException('Offer must be accepted before payment');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        offerId,
        userId,
        paymentType,
        amount,
        paymentMethod,
        utrNumber,
        paymentScreenshot,
        notes,
        paymentStatus: 'PENDING',
      },
    });

    // Update offer with payment reference
    const updateData: any = {};
    if (paymentType === 'COMMISSION') {
      updateData.sellerPaymentId = payment.id;
      updateData.sellerPaymentStatus = 'PENDING';
    } else if (paymentType === 'COMPLETE_PAYMENT') {
      updateData.buyerPaymentId = payment.id;
      updateData.buyerPaymentStatus = 'PENDING';
    }

    await this.prisma.offer.update({
      where: { id: offerId },
      data: updateData,
    });

    return payment;
  }

  async updatePaymentStatus(paymentId: string, updatePaymentStatusDto: UpdatePaymentStatusDto) {
    const { status, transactionId, gatewayResponse, processedAt } = updatePaymentStatusDto;

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        sellerOffers: true,
        buyerOffers: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: status,
        transactionId,
        gatewayResponse,
        processedAt: processedAt || (status === 'COMPLETED' ? new Date() : null),
      },
    });

    // Update offer payment status
    const offerUpdateData: any = {};
    if (payment.paymentType === 'COMMISSION') {
      offerUpdateData.sellerPaymentStatus = status;
      if (status === 'COMPLETED') {
        offerUpdateData.sellerPaidAt = new Date();
      }
    } else if (payment.paymentType === 'COMPLETE_PAYMENT') {
      offerUpdateData.buyerPaymentStatus = status;
      if (status === 'COMPLETED') {
        offerUpdateData.buyerPaidAt = new Date();
      }
    }

    // Update all related offers
    const offersToUpdate = [...payment.sellerOffers, ...payment.buyerOffers];
    for (const offer of offersToUpdate) {
      await this.prisma.offer.update({
        where: { id: offer.id },
        data: offerUpdateData,
      });
    }

    return updatedPayment;
  }

  async getPaymentsByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        include: {
          sellerOffers: {
            include: {
              requirement: true,
              offerUser: true,
            },
          },
          buyerOffers: {
            include: {
              requirement: true,
              offerUser: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({
        where: { userId },
      }),
    ]);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPaymentById(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
          },
        },
        sellerOffers: {
          include: {
            requirement: true,
            offerUser: true,
          },
        },
        buyerOffers: {
          include: {
            requirement: true,
            offerUser: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getPaymentsByOffer(offerId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { offerId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  }

  async getPaymentStats(userId: string) {
    const [totalPayments, completedPayments, pendingPayments, totalAmount] = await Promise.all([
      this.prisma.payment.count({
        where: { userId },
      }),
      this.prisma.payment.count({
        where: { 
          userId,
          paymentStatus: 'COMPLETED',
        },
      }),
      this.prisma.payment.count({
        where: { 
          userId,
          paymentStatus: 'PENDING',
        },
      }),
      this.prisma.payment.aggregate({
        where: { 
          userId,
          paymentStatus: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      totalAmount: totalAmount._sum.amount || 0,
    };
  }
}
