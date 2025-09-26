import { OfferStatus, OfferPriority } from '@prisma/client';

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
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Relations
  requirement?: {
    id: string;
    title: string;
    description: string;
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
