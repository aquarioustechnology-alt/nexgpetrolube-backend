import { ApiProperty } from '@nestjs/swagger';
import { PostingType, RequirementUrgency, RequirementStatus } from './create-requirement.dto';
import { UserRole } from '@prisma/client';

export class RequirementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: UserRole })
  userType: UserRole;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false })
  shortDescription?: string;

  @ApiProperty({ required: false })
  additionalNotes?: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ required: false })
  subcategoryId?: string;

  @ApiProperty({ required: false })
  productId?: string;

  @ApiProperty({ required: false })
  productName?: string;

  @ApiProperty({ required: false })
  brandName?: string;

  @ApiProperty({ required: false })
  quantity?: string;

  @ApiProperty({ required: false })
  availableQuantity?: string;

  @ApiProperty({ required: false })
  units?: string;

  @ApiProperty({ required: false })
  unitPrice?: string;

  @ApiProperty({ enum: PostingType })
  postingType: PostingType;

  @ApiProperty({ required: false })
  negotiableType?: string;

  @ApiProperty({ required: false })
  negotiationWindow?: string;

  @ApiProperty({ enum: RequirementUrgency })
  urgency: RequirementUrgency;

  @ApiProperty({ enum: RequirementStatus })
  status: RequirementStatus;

  @ApiProperty({ required: false })
  adminStatus?: RequirementStatus;

  @ApiProperty({ required: false })
  approvedBy?: string;

  @ApiProperty({ required: false })
  approvedAt?: Date;

  @ApiProperty({ required: false })
  rejectedBy?: string;

  @ApiProperty({ required: false })
  rejectedAt?: Date;

  @ApiProperty({ required: false })
  rejectionReason?: string;

  @ApiProperty()
  deliveryMethod: string;

  @ApiProperty()
  deliveryTimeline: string;

  @ApiProperty()
  country: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  state?: string;

  @ApiProperty({ required: false })
  technicalSpecs?: any;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  visibility: string;

  @ApiProperty({ required: false })
  visibilityType?: string;

  @ApiProperty({ type: [String] })
  visibleEmails: string[];

  @ApiProperty({ required: false })
  visibleState?: string;

  @ApiProperty({ required: false })
  visibleCity?: string;

  @ApiProperty()
  quotesCount: number;

  @ApiProperty({ required: false })
  deadline?: Date;

  // Bidding-specific fields
  @ApiProperty({ required: false })
  biddingStartDate?: string;

  @ApiProperty({ required: false })
  biddingStartTime?: string;

  @ApiProperty({ required: false })
  biddingEndDate?: string;

  @ApiProperty({ required: false })
  biddingEndTime?: string;

  @ApiProperty({ required: false })
  minimumBidDecrement?: string;

  @ApiProperty({ required: false })
  enableH1H2Split?: boolean;

  @ApiProperty({ required: false })
  h1H2SplitRatio?: string;

  @ApiProperty({ required: false })
  reservePrice?: string;

  @ApiProperty()
  postedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Relations
  @ApiProperty({ required: false })
  category?: any;

  @ApiProperty({ required: false })
  subcategory?: any;

  @ApiProperty({ required: false })
  product?: any;

  @ApiProperty({ required: false })
  brand?: any;

  @ApiProperty({ required: false })
  user?: any;

  @ApiProperty({ required: false, type: [Object] })
  offers?: any[];
}
