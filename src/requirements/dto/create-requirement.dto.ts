import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsDateString, IsJSON } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '@prisma/client';

export enum PostingType {
  REQUIREMENT = 'REQUIREMENT',
  REVERSE_BIDDING = 'REVERSE_BIDDING',
  STANDARD_BIDDING = 'STANDARD_BIDDING'
}

export enum RequirementUrgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum RequirementStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  OPEN = 'OPEN',
  QUOTED = 'QUOTED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export class CreateRequirementDto {
  @ApiProperty({ description: 'Requirement title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'User type who created the requirement', enum: UserRole })
  @IsEnum(UserRole)
  userType: UserRole;

  @ApiProperty({ description: 'Detailed description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Short description', required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @ApiProperty({ description: 'Product category ID' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Product subcategory ID', required: false })
  @IsOptional()
  @IsString()
  subcategoryId?: string;

  @ApiProperty({ description: 'Product ID', required: false })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ description: 'Product name (if not selecting from existing products)', required: false })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ description: 'Brand name', required: false })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiProperty({ description: 'Quantity required', required: false })
  @IsOptional()
  @IsString()
  quantity?: string;

  @ApiProperty({ description: 'Units for the quantity', required: false })
  @IsOptional()
  @IsString()
  units?: string;

  @ApiProperty({ description: 'Unit price or expected price', required: false })
  @IsOptional()
  @IsString()
  unitPrice?: string;

  @ApiProperty({ description: 'Posting type', enum: PostingType, default: PostingType.REQUIREMENT })
  @IsEnum(PostingType)
  postingType: PostingType = PostingType.REQUIREMENT;

  @ApiProperty({ description: 'Negotiable type', required: false })
  @IsOptional()
  @IsString()
  negotiableType?: string;

  @ApiProperty({ description: 'Negotiation window', required: false })
  @IsOptional()
  @IsString()
  negotiationWindow?: string;

  @ApiProperty({ description: 'Urgency level', enum: RequirementUrgency, default: RequirementUrgency.MEDIUM })
  @IsEnum(RequirementUrgency)
  urgency: RequirementUrgency = RequirementUrgency.MEDIUM;

  @ApiProperty({ description: 'Requirement status', enum: RequirementStatus, default: RequirementStatus.DRAFT })
  @IsEnum(RequirementStatus)
  status: RequirementStatus = RequirementStatus.DRAFT;

  @ApiProperty({ description: 'Admin approval status', enum: RequirementStatus, default: RequirementStatus.PENDING })
  @IsEnum(RequirementStatus)
  adminStatus: RequirementStatus = RequirementStatus.PENDING;

  @ApiProperty({ description: 'Delivery method' })
  @IsString()
  deliveryMethod: string;

  @ApiProperty({ description: 'Delivery timeline' })
  @IsString()
  deliveryTimeline: string;

  @ApiProperty({ description: 'Country', default: 'India' })
  @IsString()
  country: string = 'India';

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'State', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Technical specifications as JSON', required: false })
  @IsOptional()
  technicalSpecs?: any;

  @ApiProperty({ description: 'Image URLs', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'Visibility setting', default: 'public' })
  @IsString()
  visibility: string = 'public';

  @ApiProperty({ description: 'Visibility type for private posts', required: false })
  @IsOptional()
  @IsString()
  visibilityType?: string;

  @ApiProperty({ description: 'Visible emails for private posts', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  visibleEmails?: string[];

  @ApiProperty({ description: 'Visible state for private posts', required: false })
  @IsOptional()
  @IsString()
  visibleState?: string;

  @ApiProperty({ description: 'Visible city for private posts', required: false })
  @IsOptional()
  @IsString()
  visibleCity?: string;

  @ApiProperty({ description: 'Deadline for requirement', required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
