import { OfferStatus, OfferPriority, PaymentStatus } from '@prisma/client';

export class OfferResponseDto {
  id: string;
  requirementId: string;
  requirementOwnerType: string;
  offeredUnitPrice: number;
  offeredQuantity: string;
  requirementOwnerId: string;
  offerUserId: string;
  negotiableType: string;
  postingType: string;
  negotiationWindow?: number;
  deadline?: Date;
  offerStatus: OfferStatus;
  offerMessage?: string;
  parentOfferId?: string;
  offerExpiryDate?: Date;
  minimumQuantity?: string;
  maximumQuantity?: string;
  deliveryTerms?: string;
  paymentTerms?: string;
  validityPeriod?: number;
  isCounterOffer: boolean;
  offerPriority: OfferPriority;
  // Counteroffer fields
  counterofferCount: number;
  originalPrice?: number;
  originalQuantity?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Payment status fields
  sellerPaymentStatus?: PaymentStatus;
  buyerPaymentStatus?: PaymentStatus;
  sellerPaymentId?: string;
  buyerPaymentId?: string;
  sellerPaidAt?: Date;
  buyerPaidAt?: Date;

  // Relations
  requirement?: {
    id: string;
    title: string;
    description: string;
    shortDescription?: string;
    productName?: string;
    quantity?: string;
    units?: string;
    unitPrice?: string;
    negotiableType?: string;
    postingType: string;
    userType: string;
    city?: string;
    state?: string;
    deadline?: Date;
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      companyName: string;
      email: string;
      phone?: string;
    };
  };

  requirementOwner?: {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName: string;
    email: string;
    phone?: string;
  };

  offerUser?: {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName: string;
    email: string;
    phone?: string;
  };

  parentOffer?: OfferResponseDto;
  counterOffers?: OfferResponseDto[];
  counterOffersList?: {
    id: string;
    counterofferNumber: number;
    offeredPrice: number;
    offeredQuantity: string;
    status: string;
    expiresAt: Date;
    createdAt: Date;
    fromUser: {
      id: string;
      firstName?: string;
      lastName?: string;
      companyName: string;
      email: string;
    };
  }[];
  
  // Logistics information
  logistics?: {
    id: string;
    driverPhone?: string;
    truckNumber?: string;
    logisticsCompany?: string;
    estimatedDeliveryDate?: Date;
    status: string;
    createdAt: Date;
  }[];
}

export class OfferHistoryResponseDto {
  id: string;
  offerId: string;
  action: string;
  performedBy: string;
  performedAt: Date;
  notes?: string;
  oldValues?: any;
  newValues?: any;

  performer?: {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName: string;
    email: string;
  };
}

export class OfferNotificationResponseDto {
  id: string;
  offerId: string;
  recipientId: string;
  notificationType: string;
  isRead: boolean;
  createdAt: Date;

  offer?: {
    id: string;
    offeredUnitPrice: number;
    offeredQuantity: string;
    offerStatus: OfferStatus;
  };

  recipient?: {
    id: string;
    firstName?: string;
    lastName?: string;
    companyName: string;
    email: string;
  };
}
